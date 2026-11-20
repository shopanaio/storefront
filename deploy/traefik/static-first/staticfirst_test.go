package staticfirst

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestStaticHitBypassesSSRAndMissPreservesURL(t *testing.T) {
	origin := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Cookie") != "" || r.Header.Get("Authorization") != "" {
			t.Error("private headers reached S3")
		}
		if r.URL.Path == "/theme-static/site/blogs/tips/cat/index.html" {
			io.WriteString(w, "static article")
			return
		}
		http.NotFound(w, r)
	}))
	defer origin.Close()
	calls := 0
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { calls++; io.WriteString(w, r.URL.RequestURI()) })
	handler, err := New(context.Background(), next, &Config{Origin: origin.URL + "/theme-static/site", Locales: []string{"uk", "en"}}, "test")
	if err != nil {
		t.Fatal(err)
	}
	m := handler.(*Middleware)
	m.client = origin.Client()
	r := httptest.NewRequest("GET", "http://shop/blogs/tips/cat?utm_source=test", nil)
	r.Header.Set("Cookie", "session=private")
	r.Header.Set("Authorization", "Bearer private")
	w := httptest.NewRecorder()
	m.ServeHTTP(w, r)
	if calls != 0 || w.Body.String() != "static article" || w.Header().Get("X-Shopana-Static-Server") != "traefik" {
		t.Fatal("static article did not bypass SSR", w.Body.String())
	}
	w = httptest.NewRecorder()
	m.ServeHTTP(w, httptest.NewRequest("GET", "http://shop/products/missing?utm_source=test", nil))
	if calls != 1 || w.Body.String() != "/products/missing?utm_source=test" {
		t.Fatal("SSR did not receive original URL", w.Body.String())
	}
	for _, u := range []string{"/blogs/tips/cat?filter.sale=markdown", "/en/account/orders", "/cart", "/auth/token"} {
		w = httptest.NewRecorder()
		before := calls
		m.ServeHTTP(w, httptest.NewRequest("GET", "http://shop"+u, nil))
		if calls != before+1 {
			t.Fatal("dynamic route served from S3", u)
		}
	}
}
