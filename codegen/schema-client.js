export var ArticleSort;
(function (ArticleSort) {
    ArticleSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    ArticleSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    ArticleSort["TitleAsc"] = "TITLE_ASC";
    ArticleSort["TitleDesc"] = "TITLE_DESC";
    ArticleSort["UpdatedAtAsc"] = "UPDATED_AT_ASC";
    ArticleSort["UpdatedAtDesc"] = "UPDATED_AT_DESC";
})(ArticleSort || (ArticleSort = {}));
export var CategorySort;
(function (CategorySort) {
    CategorySort["CreatedAtAsc"] = "CREATED_AT_ASC";
    CategorySort["CreatedAtDesc"] = "CREATED_AT_DESC";
    CategorySort["TitleAsc"] = "TITLE_ASC";
    CategorySort["TitleDesc"] = "TITLE_DESC";
    CategorySort["UpdatedAtAsc"] = "UPDATED_AT_ASC";
    CategorySort["UpdatedAtDesc"] = "UPDATED_AT_DESC";
})(CategorySort || (CategorySort = {}));
export var CheckoutDeliveryMethodType;
(function (CheckoutDeliveryMethodType) {
    /** Pickup delivery method. */
    CheckoutDeliveryMethodType["Pickup"] = "PICKUP";
    /** Shipping delivery method. */
    CheckoutDeliveryMethodType["Shipping"] = "SHIPPING";
})(CheckoutDeliveryMethodType || (CheckoutDeliveryMethodType = {}));
/**
 * Codes for warnings that may be returned with Checkout mutations,
 * indicating non-blocking adjustments or issues in the checkout.
 */
export var CheckoutNotificationCode;
(function (CheckoutNotificationCode) {
    /** An item in the checkout is no longer available for sale. */
    CheckoutNotificationCode["ItemUnavailable"] = "ITEM_UNAVAILABLE";
    /**
     * The requested quantity exceeds available stock;
     * quantity was automatically reduced to the maximum available.
     */
    CheckoutNotificationCode["NotEnoughStock"] = "NOT_ENOUGH_STOCK";
    /** The requested item is completely out of stock and has been removed from the checkout. */
    CheckoutNotificationCode["OutOfStock"] = "OUT_OF_STOCK";
    /** The price of one or more items has changed since they were added to the checkout. */
    CheckoutNotificationCode["PriceChanged"] = "PRICE_CHANGED";
})(CheckoutNotificationCode || (CheckoutNotificationCode = {}));
export var CountryCode;
(function (CountryCode) {
    /** Andorra */
    CountryCode["Ad"] = "AD";
    /** United Arab Emirates */
    CountryCode["Ae"] = "AE";
    /** Afghanistan */
    CountryCode["Af"] = "AF";
    /** Antigua and Barbuda */
    CountryCode["Ag"] = "AG";
    /** Albania */
    CountryCode["Al"] = "AL";
    /** Armenia */
    CountryCode["Am"] = "AM";
    /** Angola */
    CountryCode["Ao"] = "AO";
    /** Argentina */
    CountryCode["Ar"] = "AR";
    /** Austria */
    CountryCode["At"] = "AT";
    /** Australia */
    CountryCode["Au"] = "AU";
    /** Aruba */
    CountryCode["Aw"] = "AW";
    /** Åland Islands */
    CountryCode["Ax"] = "AX";
    /** Azerbaijan */
    CountryCode["Az"] = "AZ";
    /** Bosnia and Herzegovina */
    CountryCode["Ba"] = "BA";
    /** Barbados */
    CountryCode["Bb"] = "BB";
    /** Bangladesh */
    CountryCode["Bd"] = "BD";
    /** Belgium */
    CountryCode["Be"] = "BE";
    /** Burkina Faso */
    CountryCode["Bf"] = "BF";
    /** Bulgaria */
    CountryCode["Bg"] = "BG";
    /** Bahrain */
    CountryCode["Bh"] = "BH";
    /** Burundi */
    CountryCode["Bi"] = "BI";
    /** Benin */
    CountryCode["Bj"] = "BJ";
    /** Bermuda */
    CountryCode["Bm"] = "BM";
    /** Brunei */
    CountryCode["Bn"] = "BN";
    /** Bolivia */
    CountryCode["Bo"] = "BO";
    /** Brazil */
    CountryCode["Br"] = "BR";
    /** Bahamas */
    CountryCode["Bs"] = "BS";
    /** Bhutan */
    CountryCode["Bt"] = "BT";
    /** Botswana */
    CountryCode["Bw"] = "BW";
    /** Belarus */
    CountryCode["By"] = "BY";
    /** Belize */
    CountryCode["Bz"] = "BZ";
    /** Canada */
    CountryCode["Ca"] = "CA";
    /** Democratic Republic of the Congo */
    CountryCode["Cd"] = "CD";
    /** Central African Republic */
    CountryCode["Cf"] = "CF";
    /** Republic of the Congo */
    CountryCode["Cg"] = "CG";
    /** Switzerland */
    CountryCode["Ch"] = "CH";
    /** Ivory Coast */
    CountryCode["Ci"] = "CI";
    /** Chile */
    CountryCode["Cl"] = "CL";
    /** Cameroon */
    CountryCode["Cm"] = "CM";
    /** China */
    CountryCode["Cn"] = "CN";
    /** Colombia */
    CountryCode["Co"] = "CO";
    /** Costa Rica */
    CountryCode["Cr"] = "CR";
    /** Cuba */
    CountryCode["Cu"] = "CU";
    /** Cape Verde */
    CountryCode["Cv"] = "CV";
    /** Curaçao */
    CountryCode["Cw"] = "CW";
    /** Cyprus */
    CountryCode["Cy"] = "CY";
    /** Czech Republic */
    CountryCode["Cz"] = "CZ";
    /** Germany */
    CountryCode["De"] = "DE";
    /** Djibouti */
    CountryCode["Dj"] = "DJ";
    /** Denmark */
    CountryCode["Dk"] = "DK";
    /** Dominica */
    CountryCode["Dm"] = "DM";
    /** Dominican Republic */
    CountryCode["Do"] = "DO";
    /** Algeria */
    CountryCode["Dz"] = "DZ";
    /** Ecuador */
    CountryCode["Ec"] = "EC";
    /** Estonia */
    CountryCode["Ee"] = "EE";
    /** Egypt */
    CountryCode["Eg"] = "EG";
    /** Western Sahara */
    CountryCode["Eh"] = "EH";
    /** Eritrea */
    CountryCode["Er"] = "ER";
    /** Spain */
    CountryCode["Es"] = "ES";
    /** Ethiopia */
    CountryCode["Et"] = "ET";
    /** Finland */
    CountryCode["Fi"] = "FI";
    /** Fiji */
    CountryCode["Fj"] = "FJ";
    /** Micronesia */
    CountryCode["Fm"] = "FM";
    /** Faroe Islands */
    CountryCode["Fo"] = "FO";
    /** France */
    CountryCode["Fr"] = "FR";
    /** Gabon */
    CountryCode["Ga"] = "GA";
    /** United Kingdom */
    CountryCode["Gb"] = "GB";
    /** Grenada */
    CountryCode["Gd"] = "GD";
    /** Georgia */
    CountryCode["Ge"] = "GE";
    /** Guernsey */
    CountryCode["Gg"] = "GG";
    /** Ghana */
    CountryCode["Gh"] = "GH";
    /** Greenland */
    CountryCode["Gl"] = "GL";
    /** Gambia */
    CountryCode["Gm"] = "GM";
    /** Guinea */
    CountryCode["Gn"] = "GN";
    /** Equatorial Guinea */
    CountryCode["Gq"] = "GQ";
    /** Greece */
    CountryCode["Gr"] = "GR";
    /** Guatemala */
    CountryCode["Gt"] = "GT";
    /** Guinea-Bissau */
    CountryCode["Gw"] = "GW";
    /** Guyana */
    CountryCode["Gy"] = "GY";
    /** Honduras */
    CountryCode["Hn"] = "HN";
    /** Croatia */
    CountryCode["Hr"] = "HR";
    /** Haiti */
    CountryCode["Ht"] = "HT";
    /** Hungary */
    CountryCode["Hu"] = "HU";
    /** Indonesia */
    CountryCode["Id"] = "ID";
    /** Ireland */
    CountryCode["Ie"] = "IE";
    /** Israel */
    CountryCode["Il"] = "IL";
    /** Isle of Man */
    CountryCode["Im"] = "IM";
    /** India */
    CountryCode["In"] = "IN";
    /** Iraq */
    CountryCode["Iq"] = "IQ";
    /** Iran */
    CountryCode["Ir"] = "IR";
    /** Iceland */
    CountryCode["Is"] = "IS";
    /** Italy */
    CountryCode["It"] = "IT";
    /** Jersey */
    CountryCode["Je"] = "JE";
    /** Jamaica */
    CountryCode["Jm"] = "JM";
    /** Jordan */
    CountryCode["Jo"] = "JO";
    /** Japan */
    CountryCode["Jp"] = "JP";
    /** Kenya */
    CountryCode["Ke"] = "KE";
    /** Kyrgyzstan */
    CountryCode["Kg"] = "KG";
    /** Cambodia */
    CountryCode["Kh"] = "KH";
    /** Comoros */
    CountryCode["Km"] = "KM";
    /** Saint Kitts and Nevis */
    CountryCode["Kn"] = "KN";
    /** North Korea */
    CountryCode["Kp"] = "KP";
    /** South Korea */
    CountryCode["Kr"] = "KR";
    /** Kuwait */
    CountryCode["Kw"] = "KW";
    /** Kazakhstan */
    CountryCode["Kz"] = "KZ";
    /** Laos */
    CountryCode["La"] = "LA";
    /** Lebanon */
    CountryCode["Lb"] = "LB";
    /** Saint Lucia */
    CountryCode["Lc"] = "LC";
    /** Liechtenstein */
    CountryCode["Li"] = "LI";
    /** Sri Lanka */
    CountryCode["Lk"] = "LK";
    /** Liberia */
    CountryCode["Lr"] = "LR";
    /** Lesotho */
    CountryCode["Ls"] = "LS";
    /** Lithuania */
    CountryCode["Lt"] = "LT";
    /** Luxembourg */
    CountryCode["Lu"] = "LU";
    /** Latvia */
    CountryCode["Lv"] = "LV";
    /** Morocco */
    CountryCode["Ma"] = "MA";
    /** Monaco */
    CountryCode["Mc"] = "MC";
    /** Moldova */
    CountryCode["Md"] = "MD";
    /** Montenegro */
    CountryCode["Me"] = "ME";
    /** Madagascar */
    CountryCode["Mg"] = "MG";
    /** Marshall Islands */
    CountryCode["Mh"] = "MH";
    /** North Macedonia */
    CountryCode["Mk"] = "MK";
    /** Mali */
    CountryCode["Ml"] = "ML";
    /** Myanmar */
    CountryCode["Mm"] = "MM";
    /** Mongolia */
    CountryCode["Mn"] = "MN";
    /** Mauritania */
    CountryCode["Mr"] = "MR";
    /** Malta */
    CountryCode["Mt"] = "MT";
    /** Mauritius */
    CountryCode["Mu"] = "MU";
    /** Maldives */
    CountryCode["Mv"] = "MV";
    /** Malawi */
    CountryCode["Mw"] = "MW";
    /** Mexico */
    CountryCode["Mx"] = "MX";
    /** Malaysia */
    CountryCode["My"] = "MY";
    /** Mozambique */
    CountryCode["Mz"] = "MZ";
    /** Namibia */
    CountryCode["Na"] = "NA";
    /** New Caledonia */
    CountryCode["Nc"] = "NC";
    /** Niger */
    CountryCode["Ne"] = "NE";
    /** Nigeria */
    CountryCode["Ng"] = "NG";
    /** Nicaragua */
    CountryCode["Ni"] = "NI";
    /** Netherlands */
    CountryCode["Nl"] = "NL";
    /** Norway */
    CountryCode["No"] = "NO";
    /** Nepal */
    CountryCode["Np"] = "NP";
    /** New Zealand */
    CountryCode["Nz"] = "NZ";
    /** Oman */
    CountryCode["Om"] = "OM";
    /** Panama */
    CountryCode["Pa"] = "PA";
    /** Peru */
    CountryCode["Pe"] = "PE";
    /** Papua New Guinea */
    CountryCode["Pg"] = "PG";
    /** Philippines */
    CountryCode["Ph"] = "PH";
    /** Pakistan */
    CountryCode["Pk"] = "PK";
    /** Poland */
    CountryCode["Pl"] = "PL";
    /** Palestine */
    CountryCode["Ps"] = "PS";
    /** Portugal */
    CountryCode["Pt"] = "PT";
    /** Palau */
    CountryCode["Pw"] = "PW";
    /** Paraguay */
    CountryCode["Py"] = "PY";
    /** Qatar */
    CountryCode["Qa"] = "QA";
    /** Romania */
    CountryCode["Ro"] = "RO";
    /** Serbia */
    CountryCode["Rs"] = "RS";
    /** Russia */
    CountryCode["Ru"] = "RU";
    /** Rwanda */
    CountryCode["Rw"] = "RW";
    /** Saudi Arabia */
    CountryCode["Sa"] = "SA";
    /** Solomon Islands */
    CountryCode["Sb"] = "SB";
    /** Seychelles */
    CountryCode["Sc"] = "SC";
    /** Sudan */
    CountryCode["Sd"] = "SD";
    /** Sweden */
    CountryCode["Se"] = "SE";
    /** Singapore */
    CountryCode["Sg"] = "SG";
    /** Slovenia */
    CountryCode["Si"] = "SI";
    /** Slovakia */
    CountryCode["Sk"] = "SK";
    /** Sierra Leone */
    CountryCode["Sl"] = "SL";
    /** San Marino */
    CountryCode["Sm"] = "SM";
    /** Senegal */
    CountryCode["Sn"] = "SN";
    /** Suriname */
    CountryCode["Sr"] = "SR";
    /** South Sudan */
    CountryCode["Ss"] = "SS";
    /** El Salvador */
    CountryCode["Sv"] = "SV";
    /** Syria */
    CountryCode["Sy"] = "SY";
    /** Swaziland (Eswatini) */
    CountryCode["Sz"] = "SZ";
    /** Chad */
    CountryCode["Td"] = "TD";
    /** Togo */
    CountryCode["Tg"] = "TG";
    /** Thailand */
    CountryCode["Th"] = "TH";
    /** Tajikistan */
    CountryCode["Tj"] = "TJ";
    /** Timor-Leste (East Timor) */
    CountryCode["Tl"] = "TL";
    /** Turkmenistan */
    CountryCode["Tm"] = "TM";
    /** Tunisia */
    CountryCode["Tn"] = "TN";
    /** Tonga */
    CountryCode["To"] = "TO";
    /** Turkey */
    CountryCode["Tr"] = "TR";
    /** Trinidad and Tobago */
    CountryCode["Tt"] = "TT";
    /** Tanzania */
    CountryCode["Tz"] = "TZ";
    /** Ukraine */
    CountryCode["Ua"] = "UA";
    /** Uganda */
    CountryCode["Ug"] = "UG";
    /** United States */
    CountryCode["Us"] = "US";
    /** Uruguay */
    CountryCode["Uy"] = "UY";
    /** Uzbekistan */
    CountryCode["Uz"] = "UZ";
    /** Vatican City */
    CountryCode["Va"] = "VA";
    /** Saint Vincent and the Grenadines */
    CountryCode["Vc"] = "VC";
    /** Venezuela */
    CountryCode["Ve"] = "VE";
    /** British Virgin Islands */
    CountryCode["Vg"] = "VG";
    /** US Virgin Islands */
    CountryCode["Vi"] = "VI";
    /** Vietnam */
    CountryCode["Vn"] = "VN";
    /** Vanuatu */
    CountryCode["Vu"] = "VU";
    /** Samoa */
    CountryCode["Ws"] = "WS";
    /** Kosovo */
    CountryCode["Xk"] = "XK";
    /** Yemen */
    CountryCode["Ye"] = "YE";
    /** South Africa */
    CountryCode["Za"] = "ZA";
    /** Zambia */
    CountryCode["Zm"] = "ZM";
    /** Zimbabwe */
    CountryCode["Zw"] = "ZW";
})(CountryCode || (CountryCode = {}));
/** Currency codes according to ISO 4217 */
export var CurrencyCode;
(function (CurrencyCode) {
    /** 2 decimals — UAE Dirham (United Arab Emirates) */
    CurrencyCode["Aed"] = "AED";
    /** 2 decimals — Afghan Afghani (Afghanistan) */
    CurrencyCode["Afn"] = "AFN";
    /** 2 decimals — Albanian Lek (Albania) */
    CurrencyCode["All"] = "ALL";
    /** 2 decimals — Armenian Dram (Armenia) */
    CurrencyCode["Amd"] = "AMD";
    /** 2 decimals — Netherlands Antillean Guilder (Netherlands Antilles) */
    CurrencyCode["Ang"] = "ANG";
    /** 2 decimals — Angolan Kwanza (Angola) */
    CurrencyCode["Aoa"] = "AOA";
    /** 2 decimals — Argentine Peso (Argentina) */
    CurrencyCode["Ars"] = "ARS";
    /** 2 decimals — Australian Dollar (Australia) */
    CurrencyCode["Aud"] = "AUD";
    /** 2 decimals — Aruban Florin (Aruba) */
    CurrencyCode["Awg"] = "AWG";
    /** 2 decimals — Azerbaijani Manat (Azerbaijan) */
    CurrencyCode["Azn"] = "AZN";
    /** 2 decimals — Bosnia-Herzegovina Convertible Mark (Bosnia and Herzegovina) */
    CurrencyCode["Bam"] = "BAM";
    /** 2 decimals — Barbadian Dollar (Barbados) */
    CurrencyCode["Bbd"] = "BBD";
    /** 2 decimals — Bangladeshi Taka (Bangladesh) */
    CurrencyCode["Bdt"] = "BDT";
    /** 2 decimals — Bulgarian Lev (Bulgaria) */
    CurrencyCode["Bgn"] = "BGN";
    /** 3 decimals — Bahraini Dinar (Bahrain) */
    CurrencyCode["Bhd"] = "BHD";
    /** 0 decimals — Burundian Franc (Burundi) */
    CurrencyCode["Bif"] = "BIF";
    /** 2 decimals — Bermudian Dollar (Bermuda) */
    CurrencyCode["Bmd"] = "BMD";
    /** 2 decimals — Brunei Dollar (Brunei) */
    CurrencyCode["Bnd"] = "BND";
    /** 2 decimals — Bolivian Boliviano (Bolivia) */
    CurrencyCode["Bob"] = "BOB";
    /** 2 decimals — Brazilian Real (Brazil) */
    CurrencyCode["Brl"] = "BRL";
    /** 2 decimals — Bahamian Dollar (Bahamas) */
    CurrencyCode["Bsd"] = "BSD";
    /** 2 decimals — Bhutanese Ngultrum (Bhutan) */
    CurrencyCode["Btn"] = "BTN";
    /** 2 decimals — Botswana Pula (Botswana) */
    CurrencyCode["Bwp"] = "BWP";
    /** 2 decimals — Belarusian Ruble (Belarus) */
    CurrencyCode["Byn"] = "BYN";
    /** 2 decimals — Belize Dollar (Belize) */
    CurrencyCode["Bzd"] = "BZD";
    /** 2 decimals — Canadian Dollar (Canada) */
    CurrencyCode["Cad"] = "CAD";
    /** 2 decimals — Congolese Franc (Democratic Republic of the Congo) */
    CurrencyCode["Cdf"] = "CDF";
    /** 2 decimals — Swiss Franc (Switzerland) */
    CurrencyCode["Chf"] = "CHF";
    /** 0 decimals — Chilean Peso (Chile) */
    CurrencyCode["Clp"] = "CLP";
    /** 2 decimals — Chinese Yuan (China) */
    CurrencyCode["Cny"] = "CNY";
    /** 2 decimals — Colombian Peso (Colombia) */
    CurrencyCode["Cop"] = "COP";
    /** 2 decimals — Costa Rican Colon (Costa Rica) */
    CurrencyCode["Crc"] = "CRC";
    /** 2 decimals — Cuban Peso (Cuba) */
    CurrencyCode["Cup"] = "CUP";
    /** 2 decimals — Cape Verdean Escudo (Cape Verde) */
    CurrencyCode["Cve"] = "CVE";
    /** 2 decimals — Czech Koruna (Czech Republic) */
    CurrencyCode["Czk"] = "CZK";
    /** 0 decimals — Djiboutian Franc (Djibouti) */
    CurrencyCode["Djf"] = "DJF";
    /** 2 decimals — Danish Krone (Denmark) */
    CurrencyCode["Dkk"] = "DKK";
    /** 2 decimals — Dominican Peso (Dominican Republic) */
    CurrencyCode["Dop"] = "DOP";
    /** 2 decimals — Algerian Dinar (Algeria) */
    CurrencyCode["Dzd"] = "DZD";
    /** 2 decimals — Egyptian Pound (Egypt) */
    CurrencyCode["Egp"] = "EGP";
    /** 2 decimals — Eritrean Nakfa (Eritrea) */
    CurrencyCode["Ern"] = "ERN";
    /** 2 decimals — Ethiopian Birr (Ethiopia) */
    CurrencyCode["Etb"] = "ETB";
    /** 2 decimals — Euro (European Union) */
    CurrencyCode["Eur"] = "EUR";
    /** 2 decimals — Fijian Dollar (Fiji) */
    CurrencyCode["Fjd"] = "FJD";
    /** 2 decimals — Falkland Islands Pound (Falkland Islands) */
    CurrencyCode["Fkp"] = "FKP";
    /** 2 decimals — Faroese Króna (Faroe Islands) */
    CurrencyCode["Fok"] = "FOK";
    /** 2 decimals — Pound Sterling (United Kingdom) */
    CurrencyCode["Gbp"] = "GBP";
    /** 2 decimals — Georgian Lari (Georgia) */
    CurrencyCode["Gel"] = "GEL";
    /** 2 decimals — Guernsey Pound (Guernsey) */
    CurrencyCode["Ggp"] = "GGP";
    /** 2 decimals — Ghanaian Cedi (Ghana) */
    CurrencyCode["Ghs"] = "GHS";
    /** 2 decimals — Gibraltar Pound (Gibraltar) */
    CurrencyCode["Gip"] = "GIP";
    /** 2 decimals — Gambian Dalasi (Gambia) */
    CurrencyCode["Gmd"] = "GMD";
    /** 0 decimals — Guinean Franc (Guinea) */
    CurrencyCode["Gnf"] = "GNF";
    /** 2 decimals — Guatemalan Quetzal (Guatemala) */
    CurrencyCode["Gtq"] = "GTQ";
    /** 2 decimals — Guyanese Dollar (Guyana) */
    CurrencyCode["Gyd"] = "GYD";
    /** 2 decimals — Hong Kong Dollar (Hong Kong) */
    CurrencyCode["Hkd"] = "HKD";
    /** 2 decimals — Honduran Lempira (Honduras) */
    CurrencyCode["Hnl"] = "HNL";
    /** 2 decimals — Croatian Kuna (Croatia) */
    CurrencyCode["Hrk"] = "HRK";
    /** 2 decimals — Haitian Gourde (Haiti) */
    CurrencyCode["Htg"] = "HTG";
    /** 2 decimals — Hungarian Forint (Hungary) */
    CurrencyCode["Huf"] = "HUF";
    /** 0 decimals — Indonesian Rupiah (Indonesia) */
    CurrencyCode["Idr"] = "IDR";
    /** 2 decimals — Israeli New Shekel (Israel) */
    CurrencyCode["Ils"] = "ILS";
    /** 2 decimals — Isle of Man Pound (Isle of Man) */
    CurrencyCode["Imp"] = "IMP";
    /** 2 decimals — Indian Rupee (India) */
    CurrencyCode["Inr"] = "INR";
    /** 3 decimals — Iraqi Dinar (Iraq) */
    CurrencyCode["Iqd"] = "IQD";
    /** 2 decimals — Iranian Rial (Iran) */
    CurrencyCode["Irr"] = "IRR";
    /** 0 decimals — Icelandic Króna (Iceland) */
    CurrencyCode["Isk"] = "ISK";
    /** 2 decimals — Jersey Pound (Jersey) */
    CurrencyCode["Jep"] = "JEP";
    /** 2 decimals — Jamaican Dollar (Jamaica) */
    CurrencyCode["Jmd"] = "JMD";
    /** 3 decimals — Jordanian Dinar (Jordan) */
    CurrencyCode["Jod"] = "JOD";
    /** 0 decimals — Japanese Yen (Japan) */
    CurrencyCode["Jpy"] = "JPY";
    /** 2 decimals — Kenyan Shilling (Kenya) */
    CurrencyCode["Kes"] = "KES";
    /** 2 decimals — Kyrgyzstani Som (Kyrgyzstan) */
    CurrencyCode["Kgs"] = "KGS";
    /** 2 decimals — Cambodian Riel (Cambodia) */
    CurrencyCode["Khr"] = "KHR";
    /** 2 decimals — Comorian Franc (Comoros) */
    CurrencyCode["Kmf"] = "KMF";
    /** 2 decimals — North Korean Won (North Korea) */
    CurrencyCode["Kpw"] = "KPW";
    /** 2 decimals — South Korean Won (South Korea) */
    CurrencyCode["Krw"] = "KRW";
    /** 3 decimals — Kuwaiti Dinar (Kuwait) */
    CurrencyCode["Kwd"] = "KWD";
    /** 2 decimals — Cayman Islands Dollar (Cayman Islands) */
    CurrencyCode["Kyd"] = "KYD";
    /** 2 decimals — Kazakhstani Tenge (Kazakhstan) */
    CurrencyCode["Kzt"] = "KZT";
    /** 2 decimals — Lao Kip (Laos) */
    CurrencyCode["Lak"] = "LAK";
    /** 2 decimals — Lebanese Pound (Lebanon) */
    CurrencyCode["Lbp"] = "LBP";
    /** 2 decimals — Sri Lankan Rupee (Sri Lanka) */
    CurrencyCode["Lkr"] = "LKR";
    /** 3 decimals — Liberian Dollar (Liberia) */
    CurrencyCode["Lrd"] = "LRD";
    /** 3 decimals — Libyan Dinar (Libya) */
    CurrencyCode["Lyd"] = "LYD";
    /** 2 decimals — Moroccan Dirham (Morocco) */
    CurrencyCode["Mad"] = "MAD";
    /** 2 decimals — Moldovan Leu (Moldova) */
    CurrencyCode["Mdl"] = "MDL";
    /** 2 decimals — Malagasy Ariary (Madagascar) */
    CurrencyCode["Mga"] = "MGA";
    /** 2 decimals — Macedonian Denar (North Macedonia) */
    CurrencyCode["Mkd"] = "MKD";
    /** 2 decimals — Burmese Kyat (Myanmar) */
    CurrencyCode["Mmk"] = "MMK";
    /** 2 decimals — Mongolian Tögrög (Mongolia) */
    CurrencyCode["Mnt"] = "MNT";
    /** 2 decimals — Macanese Pataca (Macau) */
    CurrencyCode["Mop"] = "MOP";
    /** 2 decimals — Mauritanian Ouguiya (Mauritania) */
    CurrencyCode["Mru"] = "MRU";
    /** 2 decimals — Mauritian Rupee (Mauritius) */
    CurrencyCode["Mur"] = "MUR";
    /** 2 decimals — Maldivian Rufiyaa (Maldives) */
    CurrencyCode["Mvr"] = "MVR";
    /** 2 decimals — Malawian Kwacha (Malawi) */
    CurrencyCode["Mwk"] = "MWK";
    /** 2 decimals — Mexican Peso (Mexico) */
    CurrencyCode["Mxn"] = "MXN";
    /** 2 decimals — Malaysian Ringgit (Malaysia) */
    CurrencyCode["Myr"] = "MYR";
    /** 2 decimals — Mozambican Metical (Mozambique) */
    CurrencyCode["Mzn"] = "MZN";
    /** 2 decimals — Namibian Dollar (Namibia) */
    CurrencyCode["Nad"] = "NAD";
    /** 2 decimals — Nigerian Naira (Nigeria) */
    CurrencyCode["Ngn"] = "NGN";
    /** 2 decimals — Nicaraguan Córdoba (Nicaragua) */
    CurrencyCode["Nio"] = "NIO";
    /** 2 decimals — Norwegian Krone (Norway) */
    CurrencyCode["Nok"] = "NOK";
    /** 2 decimals — Nepalese Rupee (Nepal) */
    CurrencyCode["Npr"] = "NPR";
    /** 2 decimals — New Zealand Dollar (New Zealand) */
    CurrencyCode["Nzd"] = "NZD";
    /** 2 decimals — Omani Rial (Oman) */
    CurrencyCode["Omr"] = "OMR";
    /** 2 decimals — Panamanian Balboa (Panama) */
    CurrencyCode["Pab"] = "PAB";
    /** 2 decimals — Peruvian Sol (Peru) */
    CurrencyCode["Pen"] = "PEN";
    /** 0 decimals — Papua New Guinean Kina (Papua New Guinea) */
    CurrencyCode["Pgk"] = "PGK";
    /** 2 decimals — Philippine Peso (Philippines) */
    CurrencyCode["Php"] = "PHP";
    /** 2 decimals — Pakistani Rupee (Pakistan) */
    CurrencyCode["Pkr"] = "PKR";
    /** 0 decimals — Polish Zloty (Poland) */
    CurrencyCode["Pln"] = "PLN";
    /** 2 decimals — Paraguayan Guaraní (Paraguay) */
    CurrencyCode["Pyg"] = "PYG";
    /** 2 decimals — Qatari Riyal (Qatar) */
    CurrencyCode["Qar"] = "QAR";
    /** 2 decimals — Romanian Leu (Romania) */
    CurrencyCode["Ron"] = "RON";
    /** 2 decimals — Serbian Dinar (Serbia) */
    CurrencyCode["Rsd"] = "RSD";
    /** 2 decimals — Russian Ruble (Russia) */
    CurrencyCode["Rub"] = "RUB";
    /** 2 decimals — Rwandan Franc (Rwanda) */
    CurrencyCode["Rwf"] = "RWF";
    /** 2 decimals — Saudi Riyal (Saudi Arabia) */
    CurrencyCode["Sar"] = "SAR";
    /** 2 decimals — Solomon Islands Dollar (Solomon Islands) */
    CurrencyCode["Sbd"] = "SBD";
    /** 2 decimals — Seychelles Rupee (Seychelles) */
    CurrencyCode["Scr"] = "SCR";
    /** 2 decimals — Sudanese Pound (Sudan) */
    CurrencyCode["Sdg"] = "SDG";
    /** 2 decimals — Swedish Krona (Sweden) */
    CurrencyCode["Sek"] = "SEK";
    /** 2 decimals — Singapore Dollar (Singapore) */
    CurrencyCode["Sgd"] = "SGD";
    /** 0 decimals — Saint Helena Pound (Saint Helena) */
    CurrencyCode["Shp"] = "SHP";
    /** 2 decimals — Sierra Leonean Leone (Sierra Leone) */
    CurrencyCode["Sle"] = "SLE";
    /** 2 decimals — Somali Shilling (Somalia) */
    CurrencyCode["Sos"] = "SOS";
    /** 2 decimals — Surinamese Dollar (Suriname) */
    CurrencyCode["Srd"] = "SRD";
    /** 2 decimals — South Sudanese Pound (South Sudan) */
    CurrencyCode["Ssp"] = "SSP";
    /** 2 decimals — São Tomé and Príncipe Dobra (São Tomé and Príncipe) */
    CurrencyCode["Stn"] = "STN";
    /** 2 decimals — Salvadoran Colón (El Salvador) */
    CurrencyCode["Svc"] = "SVC";
    /** 2 decimals — Syrian Pound (Syria) */
    CurrencyCode["Syp"] = "SYP";
    /** 2 decimals — Eswatini Lilangeni (Eswatini) */
    CurrencyCode["Szl"] = "SZL";
    /** 2 decimals — Thai Baht (Thailand) */
    CurrencyCode["Thb"] = "THB";
    /** 2 decimals — Tajikistani Somoni (Tajikistan) */
    CurrencyCode["Tjs"] = "TJS";
    /** 2 decimals — Turkmenistani Manat (Turkmenistan) */
    CurrencyCode["Tmt"] = "TMT";
    /** 2 decimals — Tunisian Dinar (Tunisia) */
    CurrencyCode["Tnd"] = "TND";
    /** 2 decimals — Tongan Paʻanga (Tonga) */
    CurrencyCode["Top"] = "TOP";
    /** 2 decimals — Turkish Lira (Türkiye) */
    CurrencyCode["Try"] = "TRY";
    /** 2 decimals — Trinidad and Tobago Dollar (Trinidad and Tobago) */
    CurrencyCode["Ttd"] = "TTD";
    /** 2 decimals — New Taiwan Dollar (Taiwan) */
    CurrencyCode["Twd"] = "TWD";
    /** 0 decimals — Tanzanian Shilling (Tanzania) */
    CurrencyCode["Tzs"] = "TZS";
    /** 2 decimals — Ukrainian Hryvnia (Ukraine) */
    CurrencyCode["Uah"] = "UAH";
    /** 2 decimals — Ugandan Shilling (Uganda) */
    CurrencyCode["Ugx"] = "UGX";
    /** 2 decimals — United States Dollar (United States) */
    CurrencyCode["Usd"] = "USD";
    /** 2 decimals — Uruguayan Peso (Uruguay) */
    CurrencyCode["Uyu"] = "UYU";
    /** 2 decimals — Uzbekistan Som (Uzbekistan) */
    CurrencyCode["Uzs"] = "UZS";
    /** 2 decimals — Venezuelan Bolívar (Venezuela) */
    CurrencyCode["Ves"] = "VES";
    /** 0 decimals — Vietnamese Dong (Vietnam) */
    CurrencyCode["Vnd"] = "VND";
    /** 2 decimals — Vanuatu Vatu (Vanuatu) */
    CurrencyCode["Vuv"] = "VUV";
    /** 2 decimals — Samoan Tala (Samoa) */
    CurrencyCode["Wst"] = "WST";
    /** 2 decimals — Central African CFA Franc (CEMAC) */
    CurrencyCode["Xaf"] = "XAF";
    /** 0 decimals — East Caribbean Dollar (OECS) */
    CurrencyCode["Xcd"] = "XCD";
    /** 0 decimals — Special Drawing Rights (IMF) */
    CurrencyCode["Xdr"] = "XDR";
    /** 0 decimals — West African CFA Franc (UEMOA) */
    CurrencyCode["Xof"] = "XOF";
    /** 0 decimals — CFP Franc (French overseas territories) */
    CurrencyCode["Xpf"] = "XPF";
    /** 2 decimals — Yemeni Rial (Yemen) */
    CurrencyCode["Yer"] = "YER";
    /** 2 decimals — South African Rand (South Africa) */
    CurrencyCode["Zar"] = "ZAR";
    /** 2 decimals — Zambian Kwacha (Zambia) */
    CurrencyCode["Zmw"] = "ZMW";
    /** 2 decimals — Zimbabwean Dollar (Zimbabwe) */
    CurrencyCode["Zwl"] = "ZWL";
})(CurrencyCode || (CurrencyCode = {}));
/**
 * Defines the available sorting orders for Listings.
 * Maps to Go enum portal/project/entity/listing/listingOrder.Enum.
 */
export var ListingSort;
(function (ListingSort) {
    /** Newest first */
    ListingSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    /** Oldest first */
    ListingSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    /** Recommended order based on the listing settings */
    ListingSort["MostRelevant"] = "MOST_RELEVANT";
    /** Price ascending */
    ListingSort["PriceAsc"] = "PRICE_ASC";
    /** Price descending */
    ListingSort["PriceDesc"] = "PRICE_DESC";
    /** Title ascending */
    ListingSort["TitleAsc"] = "TITLE_ASC";
    /** Title descending */
    ListingSort["TitleDesc"] = "TITLE_DESC";
})(ListingSort || (ListingSort = {}));
/** Defines the type of listing, determining how products are selected. */
export var ListingType;
(function (ListingType) {
    /** Aggregates all products from this category and its subcategories recursively. */
    ListingType["Container"] = "CONTAINER";
    /** Automatically generated by applying predefined filters. */
    ListingType["Smart"] = "SMART";
    /** Manually curated: admin selects products and defines their order; */
    ListingType["Standard"] = "STANDARD";
})(ListingType || (ListingType = {}));
/** Language codes based on ISO 639-1 and BCP 47 */
export var LocaleCode;
(function (LocaleCode) {
    /** Afrikaans */
    LocaleCode["Af"] = "af";
    /** Amharic */
    LocaleCode["Am"] = "am";
    /** Arabic */
    LocaleCode["Ar"] = "ar";
    /** Azerbaijani */
    LocaleCode["Az"] = "az";
    /** Bulgarian */
    LocaleCode["Bg"] = "bg";
    /** Bengali */
    LocaleCode["Bn"] = "bn";
    /** Catalan */
    LocaleCode["Ca"] = "ca";
    /** Czech */
    LocaleCode["Cs"] = "cs";
    /** Welsh */
    LocaleCode["Cy"] = "cy";
    /** Danish */
    LocaleCode["Da"] = "da";
    /** German */
    LocaleCode["De"] = "de";
    /** Greek */
    LocaleCode["El"] = "el";
    /** English */
    LocaleCode["En"] = "en";
    /** Esperanto */
    LocaleCode["Eo"] = "eo";
    /** Spanish */
    LocaleCode["Es"] = "es";
    /** Estonian */
    LocaleCode["Et"] = "et";
    /** Basque */
    LocaleCode["Eu"] = "eu";
    /** Persian (Farsi) */
    LocaleCode["Fa"] = "fa";
    /** Finnish */
    LocaleCode["Fi"] = "fi";
    /** Filipino */
    LocaleCode["Fil"] = "fil";
    /** French */
    LocaleCode["Fr"] = "fr";
    /** Irish */
    LocaleCode["Ga"] = "ga";
    /** Scottish Gaelic */
    LocaleCode["Gd"] = "gd";
    /** Galician */
    LocaleCode["Gl"] = "gl";
    /** Gujarati */
    LocaleCode["Gu"] = "gu";
    /** Hebrew */
    LocaleCode["He"] = "he";
    /** Hindi */
    LocaleCode["Hi"] = "hi";
    /** Croatian */
    LocaleCode["Hr"] = "hr";
    /** Haitian Creole */
    LocaleCode["Ht"] = "ht";
    /** Hungarian */
    LocaleCode["Hu"] = "hu";
    /** Armenian */
    LocaleCode["Hy"] = "hy";
    /** Indonesian */
    LocaleCode["Id"] = "id";
    /** Igbo */
    LocaleCode["Ig"] = "ig";
    /** Icelandic */
    LocaleCode["Is"] = "is";
    /** Italian */
    LocaleCode["It"] = "it";
    /** Japanese */
    LocaleCode["Ja"] = "ja";
    /** Georgian */
    LocaleCode["Ka"] = "ka";
    /** Kazakh */
    LocaleCode["Kk"] = "kk";
    /** Khmer */
    LocaleCode["Km"] = "km";
    /** Kannada */
    LocaleCode["Kn"] = "kn";
    /** Korean */
    LocaleCode["Ko"] = "ko";
    /** Kurdish */
    LocaleCode["Ku"] = "ku";
    /** Kyrgyz */
    LocaleCode["Ky"] = "ky";
    /** Latin */
    LocaleCode["La"] = "la";
    /** Lao */
    LocaleCode["Lo"] = "lo";
    /** Lithuanian */
    LocaleCode["Lt"] = "lt";
    /** Latvian */
    LocaleCode["Lv"] = "lv";
    /** Malagasy */
    LocaleCode["Mg"] = "mg";
    /** Maori */
    LocaleCode["Mi"] = "mi";
    /** Malayalam */
    LocaleCode["Ml"] = "ml";
    /** Mongolian */
    LocaleCode["Mn"] = "mn";
    /** Marathi */
    LocaleCode["Mr"] = "mr";
    /** Malay */
    LocaleCode["Ms"] = "ms";
    /** Burmese */
    LocaleCode["My"] = "my";
    /** Nepali */
    LocaleCode["Ne"] = "ne";
    /** Dutch */
    LocaleCode["Nl"] = "nl";
    /** Norwegian */
    LocaleCode["No"] = "no";
    /** Punjabi */
    LocaleCode["Pa"] = "pa";
    /** Polish */
    LocaleCode["Pl"] = "pl";
    /** Pashto */
    LocaleCode["Ps"] = "ps";
    /** Portuguese (Portugal/Brazil unified) */
    LocaleCode["Pt"] = "pt";
    /** Romanian */
    LocaleCode["Ro"] = "ro";
    /** Russian */
    LocaleCode["Ru"] = "ru";
    /** Sinhala */
    LocaleCode["Si"] = "si";
    /** Slovak */
    LocaleCode["Sk"] = "sk";
    /** Slovenian */
    LocaleCode["Sl"] = "sl";
    /** Samoan */
    LocaleCode["Sm"] = "sm";
    /** Serbian */
    LocaleCode["Sr"] = "sr";
    /** Swedish */
    LocaleCode["Sv"] = "sv";
    /** Swahili */
    LocaleCode["Sw"] = "sw";
    /** Tamil */
    LocaleCode["Ta"] = "ta";
    /** Telugu */
    LocaleCode["Te"] = "te";
    /** Tajik */
    LocaleCode["Tg"] = "tg";
    /** Thai */
    LocaleCode["Th"] = "th";
    /** Turkmen */
    LocaleCode["Tk"] = "tk";
    /** Tongan */
    LocaleCode["To"] = "to";
    /** Turkish */
    LocaleCode["Tr"] = "tr";
    /** Ukrainian */
    LocaleCode["Uk"] = "uk";
    /** Uzbek */
    LocaleCode["Uz"] = "uz";
    /** Vietnamese */
    LocaleCode["Vi"] = "vi";
    /** Xhosa */
    LocaleCode["Xh"] = "xh";
    /** Yoruba */
    LocaleCode["Yo"] = "yo";
    /** Chinese (Simplified, China) */
    LocaleCode["ZhCn"] = "zh_CN";
    /** Chinese (Traditional, Taiwan) */
    LocaleCode["ZhTw"] = "zh_TW";
    /** Zulu */
    LocaleCode["Zu"] = "zu";
})(LocaleCode || (LocaleCode = {}));
/** Source of the media file. */
export var MediaSource;
(function (MediaSource) {
    /** The file is available at an arbitrary URL. */
    MediaSource["Url"] = "URL";
    /** YouTube video (the `url` field contains the YouTube Video ID). */
    MediaSource["Youtube"] = "YOUTUBE";
})(MediaSource || (MediaSource = {}));
export var MenuItemSort;
(function (MenuItemSort) {
    MenuItemSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    MenuItemSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    MenuItemSort["TitleAsc"] = "TITLE_ASC";
    MenuItemSort["TitleDesc"] = "TITLE_DESC";
    MenuItemSort["UpdatedAtAsc"] = "UPDATED_AT_ASC";
    MenuItemSort["UpdatedAtDesc"] = "UPDATED_AT_DESC";
})(MenuItemSort || (MenuItemSort = {}));
export var MenuSort;
(function (MenuSort) {
    MenuSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    MenuSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    MenuSort["TitleAsc"] = "TITLE_ASC";
    MenuSort["TitleDesc"] = "TITLE_DESC";
    MenuSort["UpdatedAtAsc"] = "UPDATED_AT_ASC";
    MenuSort["UpdatedAtDesc"] = "UPDATED_AT_DESC";
})(MenuSort || (MenuSort = {}));
/** Severity levels for checkout warnings. */
export var NotificationSeverity;
(function (NotificationSeverity) {
    /** Informational notice; does not indicate any change in checkout data. */
    NotificationSeverity["Info"] = "INFO";
    /** Notification about automatic adjustments (e.g., quantity reduced). */
    NotificationSeverity["Warning"] = "WARNING";
})(NotificationSeverity || (NotificationSeverity = {}));
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Active"] = "ACTIVE";
    OrderStatus["Cancelled"] = "CANCELLED";
    OrderStatus["Closed"] = "CLOSED";
    OrderStatus["Draft"] = "DRAFT";
})(OrderStatus || (OrderStatus = {}));
export var PageSort;
(function (PageSort) {
    PageSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    PageSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    PageSort["TitleAsc"] = "TITLE_ASC";
    PageSort["TitleDesc"] = "TITLE_DESC";
    PageSort["UpdatedAtAsc"] = "UPDATED_AT_ASC";
    PageSort["UpdatedAtDesc"] = "UPDATED_AT_DESC";
})(PageSort || (PageSort = {}));
/** Payment flow for the method, aligned with payment-plugin-sdk. */
export var PaymentFlow;
(function (PaymentFlow) {
    /** Customer pays offline via provider (QR code, display code, etc). */
    PaymentFlow["Offline"] = "OFFLINE";
    /** Customer pays online via provider (redirect/app flow handled externally). */
    PaymentFlow["Online"] = "ONLINE";
    /** Customer pays later/on delivery or by invoice (offline instructions). */
    PaymentFlow["OnDelivery"] = "ON_DELIVERY";
})(PaymentFlow || (PaymentFlow = {}));
/** Available pricing modes for group items. */
export var ProductGroupPriceType;
(function (ProductGroupPriceType) {
    /** Use the product's standard price. */
    ProductGroupPriceType["Base"] = "BASE";
    /** Add a fixed markup (the `amount` field) to the base price. */
    ProductGroupPriceType["Fixed"] = "FIXED";
    /** Include the item free of charge. */
    ProductGroupPriceType["Free"] = "FREE";
    /** Add a percentage markup (the `percentage` field) to the base price. */
    ProductGroupPriceType["Percent"] = "PERCENT";
})(ProductGroupPriceType || (ProductGroupPriceType = {}));
/** How a product option is displayed in the UI. */
export var ProductOptionDisplayType;
(function (ProductOptionDisplayType) {
    /** Apparel size control (e.g., S, M, L, XL). */
    ProductOptionDisplayType["ApparelSize"] = "APPAREL_SIZE";
    /** Display options in a dropdown select. */
    ProductOptionDisplayType["Dropdown"] = "DROPDOWN";
    /** Display options as radio buttons with text. */
    ProductOptionDisplayType["Radio"] = "RADIO";
    /** Display a swatch (color or image). */
    ProductOptionDisplayType["Swatch"] = "SWATCH";
    /** Display an image (e.g., picture or video). */
    ProductOptionDisplayType["VariantCover"] = "VARIANT_COVER";
})(ProductOptionDisplayType || (ProductOptionDisplayType = {}));
export var ProductReviewSort;
(function (ProductReviewSort) {
    ProductReviewSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    ProductReviewSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    ProductReviewSort["HelpfulYesDesc"] = "HELPFUL_YES_DESC";
    ProductReviewSort["RatingDesc"] = "RATING_DESC";
})(ProductReviewSort || (ProductReviewSort = {}));
/** Review status. */
export var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["Approved"] = "APPROVED";
    ReviewStatus["Pending"] = "PENDING";
    ReviewStatus["Rejected"] = "REJECTED";
})(ReviewStatus || (ReviewStatus = {}));
/** Shipping payment model */
export var ShippingPaymentModel;
(function (ShippingPaymentModel) {
    /** Customer pays carrier directly, NOT included in grandTotal */
    ShippingPaymentModel["CarrierDirect"] = "CARRIER_DIRECT";
    /** Customer pays merchant, included in grandTotal */
    ShippingPaymentModel["MerchantCollected"] = "MERCHANT_COLLECTED";
})(ShippingPaymentModel || (ShippingPaymentModel = {}));
export var SwatchDisplayType;
(function (SwatchDisplayType) {
    SwatchDisplayType["Color"] = "COLOR";
    SwatchDisplayType["ColorDuo"] = "COLOR_DUO";
    SwatchDisplayType["Image"] = "IMAGE";
})(SwatchDisplayType || (SwatchDisplayType = {}));
export var TagSort;
(function (TagSort) {
    TagSort["CreatedAtAsc"] = "CREATED_AT_ASC";
    TagSort["CreatedAtDesc"] = "CREATED_AT_DESC";
    TagSort["TitleAsc"] = "TITLE_ASC";
    TagSort["TitleDesc"] = "TITLE_DESC";
    TagSort["UpdatedAtAsc"] = "UPDATED_AT_ASC";
    TagSort["UpdatedAtDesc"] = "UPDATED_AT_DESC";
})(TagSort || (TagSort = {}));
