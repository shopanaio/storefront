package staticfirst

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"regexp"
	"strings"
	"time"
)

// Config is the public static-site origin; no storage credentials reach Traefik.
type Config struct {
	Origin    string   `json:"origin,omitempty"`
	Locales   []string `json:"locales,omitempty"`
	TimeoutMs int      `json:"timeoutMs,omitempty"`
}

func CreateConfig() *Config { return &Config{TimeoutMs: 5000} }

type Middleware struct {
	next    http.Handler
	origin  *url.URL
	locales []string
	client  *http.Client
}

func New(ctx context.Context, next http.Handler, config *Config, name string) (http.Handler, error) {
	origin, err := url.Parse(config.Origin)
	if err != nil || origin.Scheme != "https" || origin.Host == "" || origin.User != nil || origin.RawQuery != "" {
		return nil, fmt.Errorf("static origin must be an absolute HTTPS URL")
	}
	timeout := config.TimeoutMs
	if timeout <= 0 {
		timeout = 5000
	}
	return &Middleware{next: next, origin: origin, locales: config.Locales, client: &http.Client{Timeout: time.Duration(timeout) * time.Millisecond, CheckRedirect: func(r *http.Request, via []*http.Request) error { return http.ErrUseLastResponse }}}, nil
}

func (m *Middleware) objectKey(r *http.Request) string {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		return ""
	}
	// Any parameter that changes a page remains SSR; tracking parameters do not change HTML.
	for key := range r.URL.Query() {
		if strings.HasPrefix(strings.ToLower(key), "utm_") {
			continue
		}
		switch strings.ToLower(key) {
		case "gclid", "gbraid", "wbraid", "dclid", "fbclid", "msclkid", "yclid", "ttclid", "twclid", "li_fat_id", "mc_cid", "mc_eid", "igshid":
		default:
			return ""
		}
	}
	raw := strings.ToLower(r.URL.EscapedPath())
	if strings.Contains(raw, "%2f") || strings.Contains(raw, "%5c") {
		return ""
	}
	p := strings.TrimSuffix(r.URL.Path, "/")
	if p == "" {
		return "index.html"
	}
	if !strings.HasPrefix(p, "/") || strings.Contains(p, "\\") {
		return ""
	}
	parts := strings.Split(p[1:], "/")
	for _, part := range parts {
		if part == "" || part == "." || part == ".." || strings.HasPrefix(part, "__") {
			return ""
		}
	}
	unlocalized := parts
	for _, locale := range m.locales {
		if strings.EqualFold(parts[0], locale) {
			unlocalized = parts[1:]
			break
		}
	}
	if len(unlocalized) > 0 {
		switch unlocalized[0] {
		case "auth", "account", "cart", "checkout", "api", "graphql", "apps", "newsletter", "search", ".well-known", "cdn-cgi":
			return ""
		}
	}
	if strings.HasPrefix(p, "/assets/") {
		return p[1:]
	}
	if p == "/robots.txt" || p == "/sitemap.xml" || (strings.HasPrefix(p, "/sitemaps/") && strings.HasSuffix(p, ".xml")) {
		return p[1:]
	}
	if regexp.MustCompile(`\.[a-zA-Z0-9]+$`).MatchString(parts[len(parts)-1]) {
		return ""
	}
	return p[1:] + "/index.html"
}

func (m *Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	key := m.objectKey(r)
	if key == "" {
		m.next.ServeHTTP(w, r)
		return
	}
	target := *m.origin
	target.Path = path.Join(m.origin.Path, key)
	target.RawPath = ""
	upstream, err := http.NewRequestWithContext(r.Context(), r.Method, target.String(), nil)
	if err != nil {
		m.next.ServeHTTP(w, r)
		return
	}
	// Public object requests never carry cookies, account credentials, or client-supplied hosts.
	for _, name := range []string{"If-None-Match", "If-Modified-Since", "Range", "If-Range"} {
		if value := r.Header.Get(name); value != "" {
			upstream.Header.Set(name, value)
		}
	}
	response, err := m.client.Do(upstream)
	if err != nil {
		m.next.ServeHTTP(w, r)
		return
	}
	defer response.Body.Close()
	if response.StatusCode != 200 && response.StatusCode != 206 && response.StatusCode != 304 {
		io.Copy(io.Discard, io.LimitReader(response.Body, 16384))
		m.next.ServeHTTP(w, r)
		return
	}
	for name, values := range response.Header {
		switch strings.ToLower(name) {
		case "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "set-cookie":
			continue
		}
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}
	w.Header().Set("X-Shopana-Static", "hit")
	w.Header().Set("X-Shopana-Static-Server", "traefik")
	w.Header().Set("Cache-Control", "public, max-age=0, must-revalidate")
	w.WriteHeader(response.StatusCode)
	if r.Method != http.MethodHead {
		io.Copy(w, response.Body)
	}
}
