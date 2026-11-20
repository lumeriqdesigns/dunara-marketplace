/**
 * Nigerian states + structured Kwara State areas (MVP launch geography).
 * City field on shops stores the location *name* for display/filter compatibility.
 */

export const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export type DeliveryZone =
  | "ilorin_metro"
  | "ilorin_outskirts"
  | "regional_towns";

export type KwaraLocation = {
  name: string;
  slug: string;
  lga: string;
  delivery_zone: DeliveryZone;
  lat: number;
  lng: number;
};

/** All curated Kwara areas (Ilorin metro, outskirts, regional towns). */
export const KWARA_LOCATIONS: readonly KwaraLocation[] = [
  {
    "name": "GRA (Government Reserved Area), Ilorin",
    "slug": "gra-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.485,
    "lng": 4.576
  },
  {
    "name": "Gure",
    "slug": "gure",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 9.385,
    "lng": 3.312
  },
  {
    "name": "Gwanara",
    "slug": "gwanara",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 9.085,
    "lng": 3.285
  },
  {
    "name": "Idera",
    "slug": "idera",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.395,
    "lng": 4.842
  },
  {
    "name": "Idofian",
    "slug": "idofian",
    "lga": "Ifelodun",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.382,
    "lng": 4.695
  },
  {
    "name": "Idofin",
    "slug": "idofin",
    "lga": "Oke-Ero",
    "delivery_zone": "regional_towns",
    "lat": 8.095,
    "lng": 5.192
  },
  {
    "name": "Igbaja",
    "slug": "igbaja",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.3833,
    "lng": 4.8833
  },
  {
    "name": "Igbawere",
    "slug": "igbawere",
    "lga": "Offa",
    "delivery_zone": "regional_towns",
    "lat": 8.152,
    "lng": 4.732
  },
  {
    "name": "Igosun",
    "slug": "igosun",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.175,
    "lng": 4.672
  },
  {
    "name": "Ijagbo",
    "slug": "ijagbo",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.188,
    "lng": 4.728
  },
  {
    "name": "Ijan",
    "slug": "ijan",
    "lga": "Irepodun",
    "delivery_zone": "regional_towns",
    "lat": 8.195,
    "lng": 4.918
  },
  {
    "name": "Ijara-Isin",
    "slug": "ijara-isin",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.248,
    "lng": 4.992
  },
  {
    "name": "Ikotun",
    "slug": "ikotun",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.245,
    "lng": 4.668
  },
  {
    "name": "Ile-Apa",
    "slug": "ile-apa",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.562,
    "lng": 4.685
  },
  {
    "name": "Ile-Ire",
    "slug": "ile-ire",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.435,
    "lng": 5.012
  },
  {
    "name": "Ilemona",
    "slug": "ilemona",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.212,
    "lng": 4.685
  },
  {
    "name": "Ilesha-Baruba",
    "slug": "ilesha-baruba",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 8.9167,
    "lng": 3.4167
  },
  {
    "name": "Iloffa",
    "slug": "iloffa",
    "lga": "Oke-Ero",
    "delivery_zone": "regional_towns",
    "lat": 8.0833,
    "lng": 5.1333
  },
  {
    "name": "Ilorin (Central / General)",
    "slug": "ilorin-central",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4966,
    "lng": 4.5421
  },
  {
    "name": "Ilota",
    "slug": "ilota",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.415,
    "lng": 4.662
  },
  {
    "name": "Iludun-Oro",
    "slug": "iludun-oro",
    "lga": "Irepodun",
    "delivery_zone": "regional_towns",
    "lat": 8.218,
    "lng": 4.868
  },
  {
    "name": "Imode",
    "slug": "imode",
    "lga": "Oke-Ero",
    "delivery_zone": "regional_towns",
    "lat": 8.062,
    "lng": 5.162
  },
  {
    "name": "Ipaiye",
    "slug": "ipaiye",
    "lga": "Moro",
    "delivery_zone": "regional_towns",
    "lat": 8.712,
    "lng": 4.385
  },
  {
    "name": "Ipata Market, Ilorin",
    "slug": "ipata-market-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.5035,
    "lng": 4.5595
  },
  {
    "name": "Ipee",
    "slug": "ipee",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.208,
    "lng": 4.782
  },
  {
    "name": "Iponrin",
    "slug": "iponrin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.595,
    "lng": 4.745
  },
  {
    "name": "Irewolede, Ilorin",
    "slug": "irewolede-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.464,
    "lng": 4.528
  },
  {
    "name": "Irra",
    "slug": "irra",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.165,
    "lng": 4.652
  },
  {
    "name": "Isanlu-Isin",
    "slug": "isanlu-isin",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.268,
    "lng": 5.028
  },
  {
    "name": "Isapa",
    "slug": "isapa",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.095,
    "lng": 5.318
  },
  {
    "name": "Isare-Opin",
    "slug": "isare-opin",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.072,
    "lng": 5.218
  },
  {
    "name": "Isolo-Opin",
    "slug": "isolo-opin",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.068,
    "lng": 5.228
  },
  {
    "name": "Ita-Amodu, Ilorin",
    "slug": "ita-amodu-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.492,
    "lng": 4.546
  },
  {
    "name": "Ita-Egba, Ilorin",
    "slug": "ita-egba-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.484,
    "lng": 4.521
  },
  {
    "name": "Ita-Elepa, Ilorin",
    "slug": "ita-elepa-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.469,
    "lng": 4.516
  },
  {
    "name": "Iwo",
    "slug": "iwo",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.288,
    "lng": 5.045
  },
  {
    "name": "Iyana Share",
    "slug": "iyana-share",
    "lga": "Ifelodun",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.815,
    "lng": 4.925
  },
  {
    "name": "Jebba",
    "slug": "jebba",
    "lga": "Moro",
    "delivery_zone": "regional_towns",
    "lat": 9.1194,
    "lng": 4.8236
  },
  {
    "name": "Jebba Road, Ilorin",
    "slug": "jebba-road-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.518,
    "lng": 4.578
  },
  {
    "name": "Kaiama",
    "slug": "kaiama",
    "lga": "Kaiama",
    "delivery_zone": "regional_towns",
    "lat": 9.6053,
    "lng": 3.941
  },
  {
    "name": "Kanikoro",
    "slug": "kanikoro",
    "lga": "Kaiama",
    "delivery_zone": "regional_towns",
    "lat": 9.562,
    "lng": 3.895
  },
  {
    "name": "Kemanji",
    "slug": "kemanji",
    "lga": "Kaiama",
    "delivery_zone": "regional_towns",
    "lat": 9.442,
    "lng": 4.185
  },
  {
    "name": "Kilanko, Ilorin",
    "slug": "kilanko-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.452,
    "lng": 4.588
  },
  {
    "name": "Koro (Ekiti)",
    "slug": "koro-ekiti",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.135,
    "lng": 5.385
  },
  {
    "name": "Koro (Patigi)",
    "slug": "koro-patigi",
    "lga": "Patigi",
    "delivery_zone": "regional_towns",
    "lat": 8.695,
    "lng": 5.752
  },
  {
    "name": "Kosubosu",
    "slug": "kosubosu",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 9.5833,
    "lng": 3.25
  },
  {
    "name": "Kpada",
    "slug": "kpada",
    "lga": "Patigi",
    "delivery_zone": "regional_towns",
    "lat": 8.665,
    "lng": 5.912
  },
  {
    "name": "Kugiji",
    "slug": "kugiji",
    "lga": "Kaiama",
    "delivery_zone": "regional_towns",
    "lat": 9.652,
    "lng": 3.985
  },
  {
    "name": "Kulende, Ilorin",
    "slug": "kulende-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.514,
    "lng": 4.585
  },
  {
    "name": "Kusogi",
    "slug": "kusogi",
    "lga": "Patigi",
    "delivery_zone": "regional_towns",
    "lat": 8.742,
    "lng": 5.685
  },
  {
    "name": "Kwara Poly Area (Elekoyangan), Ilorin",
    "slug": "kwara-poly-area-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.546,
    "lng": 4.618
  },
  {
    "name": "Lade",
    "slug": "lade",
    "lga": "Patigi",
    "delivery_zone": "regional_towns",
    "lat": 8.758,
    "lng": 5.585
  },
  {
    "name": "Laduba",
    "slug": "laduba",
    "lga": "Asa",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.352,
    "lng": 4.512
  },
  {
    "name": "Lafiagi",
    "slug": "lafiagi",
    "lga": "Edu",
    "delivery_zone": "regional_towns",
    "lat": 8.8528,
    "lng": 5.4164
  },
  {
    "name": "Lajiki",
    "slug": "lajiki",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.575,
    "lng": 4.662
  },
  {
    "name": "Lanwa",
    "slug": "lanwa",
    "lga": "Moro",
    "delivery_zone": "regional_towns",
    "lat": 8.775,
    "lng": 4.645
  },
  {
    "name": "Lema",
    "slug": "lema",
    "lga": "Edu",
    "delivery_zone": "regional_towns",
    "lat": 8.912,
    "lng": 5.295
  },
  {
    "name": "Malete",
    "slug": "malete",
    "lga": "Moro",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.7115,
    "lng": 4.469
  },
  {
    "name": "Mandate Market, Ilorin",
    "slug": "mandate-market-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4818,
    "lng": 4.5115
  },
  {
    "name": "Maraba, Ilorin",
    "slug": "maraba-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4985,
    "lng": 4.568
  },
  {
    "name": "MFM / Pipeline Road, Ilorin",
    "slug": "mfm-pipeline-road-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.472,
    "lng": 4.585
  },
  {
    "name": "Muritala Muhammed Way, Ilorin",
    "slug": "muritala-muhammed-way-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.488,
    "lng": 4.561
  },
  {
    "name": "New Yidi Road, Ilorin",
    "slug": "new-yidi-road-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.469,
    "lng": 4.562
  },
  {
    "name": "Niger Road, Ilorin",
    "slug": "niger-road-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.491,
    "lng": 4.552
  },
  {
    "name": "Oba-Isin",
    "slug": "oba-isin",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.232,
    "lng": 4.975
  },
  {
    "name": "Obbo-Aiyegunle",
    "slug": "obbo-aiyegunle",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.092,
    "lng": 5.258
  },
  {
    "name": "Obbo-Ile",
    "slug": "obbo-ile",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.112,
    "lng": 5.268
  },
  {
    "name": "Odo-Eku",
    "slug": "odo-eku",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.258,
    "lng": 5.018
  },
  {
    "name": "Odo-Owa",
    "slug": "odo-owa",
    "lga": "Oke-Ero",
    "delivery_zone": "regional_towns",
    "lat": 8.078,
    "lng": 5.125
  },
  {
    "name": "Offa",
    "slug": "offa",
    "lga": "Offa",
    "delivery_zone": "regional_towns",
    "lat": 8.1491,
    "lng": 4.7207
  },
  {
    "name": "Offa Garage, Ilorin",
    "slug": "offa-garage-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4585,
    "lng": 4.572
  },
  {
    "name": "Ogbondoroko",
    "slug": "ogbondoroko",
    "lga": "Asa",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.372,
    "lng": 4.548
  },
  {
    "name": "Ogele",
    "slug": "ogele",
    "lga": "Asa",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.388,
    "lng": 4.512
  },
  {
    "name": "Ogidi, Ilorin",
    "slug": "ogidi-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.495,
    "lng": 4.508
  },
  {
    "name": "Oja-Gbooro, Ilorin",
    "slug": "oja-gbooro-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.508,
    "lng": 4.565
  },
  {
    "name": "Oja-Iya, Ilorin",
    "slug": "oja-iya-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.486,
    "lng": 4.548
  },
  {
    "name": "Oja-Oba, Ilorin",
    "slug": "oja-oba-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4975,
    "lng": 4.547
  },
  {
    "name": "Oja-Tuntun, Ilorin",
    "slug": "oja-tuntun-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4875,
    "lng": 4.5425
  },
  {
    "name": "Ojoku",
    "slug": "ojoku",
    "lga": "Oyun",
    "delivery_zone": "regional_towns",
    "lat": 8.215,
    "lng": 4.718
  },
  {
    "name": "Oke-Foma, Ilorin",
    "slug": "oke-foma-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.498,
    "lng": 4.518
  },
  {
    "name": "Oke-Ode",
    "slug": "oke-ode",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.4917,
    "lng": 5.05
  },
  {
    "name": "Oke-Odo, Ilorin",
    "slug": "oke-odo-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4785,
    "lng": 4.621
  },
  {
    "name": "Oke-Onigbin",
    "slug": "oke-onigbin",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.242,
    "lng": 4.952
  },
  {
    "name": "Oke-Ose, Ilorin",
    "slug": "oke-ose-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.538,
    "lng": 4.602
  },
  {
    "name": "Oke-Oyi",
    "slug": "oke-oyi",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.5833,
    "lng": 4.7167
  },
  {
    "name": "Okelele, Ilorin",
    "slug": "okelele-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.515,
    "lng": 4.555
  },
  {
    "name": "Oko",
    "slug": "oko",
    "lga": "Irepodun",
    "delivery_zone": "regional_towns",
    "lat": 8.158,
    "lng": 5.085
  },
  {
    "name": "Oko-Erin, Ilorin",
    "slug": "oko-erin-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.481,
    "lng": 4.549
  },
  {
    "name": "Okuta",
    "slug": "okuta",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 9.2167,
    "lng": 3.1833
  },
  {
    "name": "Old Yidi Road, Ilorin",
    "slug": "old-yidi-road-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.476,
    "lng": 4.544
  },
  {
    "name": "Oloje, Ilorin",
    "slug": "oloje-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.508,
    "lng": 4.515
  },
  {
    "name": "Olooru",
    "slug": "olooru",
    "lga": "Moro",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.695,
    "lng": 4.595
  },
  {
    "name": "Olorunsogo, Ilorin",
    "slug": "olorunsogo-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.474,
    "lng": 4.534
  },
  {
    "name": "Olunlade, Ilorin",
    "slug": "olunlade-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.448,
    "lng": 4.582
  },
  {
    "name": "Omoda, Ilorin",
    "slug": "omoda-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.502,
    "lng": 4.542
  },
  {
    "name": "Omode",
    "slug": "omode",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.425,
    "lng": 4.685
  },
  {
    "name": "Omu-Aran",
    "slug": "omu-aran",
    "lga": "Irepodun",
    "delivery_zone": "regional_towns",
    "lat": 8.1386,
    "lng": 5.1026
  },
  {
    "name": "Omupo",
    "slug": "omupo",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.2833,
    "lng": 4.8
  },
  {
    "name": "Ora",
    "slug": "ora",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.452,
    "lng": 5.085
  },
  {
    "name": "Oro",
    "slug": "oro",
    "lga": "Irepodun",
    "delivery_zone": "regional_towns",
    "lat": 8.231,
    "lng": 4.885
  },
  {
    "name": "Oro-Ago",
    "slug": "oro-ago",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.395,
    "lng": 5.065
  },
  {
    "name": "Osi",
    "slug": "osi",
    "lga": "Ekiti",
    "delivery_zone": "regional_towns",
    "lat": 8.0667,
    "lng": 5.25
  },
  {
    "name": "Osin, Ilorin",
    "slug": "osin-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.452,
    "lng": 4.485
  },
  {
    "name": "Otte",
    "slug": "otte",
    "lga": "Asa",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.348,
    "lng": 4.432
  },
  {
    "name": "Owode Market, Offa",
    "slug": "owode-market-offa",
    "lga": "Offa",
    "delivery_zone": "regional_towns",
    "lat": 8.1465,
    "lng": 4.7185
  },
  {
    "name": "Owode-Ofaro",
    "slug": "owode-ofaro",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.472,
    "lng": 5.025
  },
  {
    "name": "Owu-Isin",
    "slug": "owu-isin",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.2833,
    "lng": 5.0333
  },
  {
    "name": "Pakata, Ilorin",
    "slug": "pakata-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.496,
    "lng": 4.531
  },
  {
    "name": "Pamo-Isin",
    "slug": "pamo-isin",
    "lga": "Isin",
    "delivery_zone": "regional_towns",
    "lat": 8.252,
    "lng": 4.985
  },
  {
    "name": "Pampo",
    "slug": "pampo",
    "lga": "Asa",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.395,
    "lng": 4.532
  },
  {
    "name": "Patigi",
    "slug": "patigi",
    "lga": "Patigi",
    "delivery_zone": "regional_towns",
    "lat": 8.7285,
    "lng": 5.7556
  },
  {
    "name": "Post Office, Ilorin",
    "slug": "post-office-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.487,
    "lng": 4.5585
  },
  {
    "name": "Rogun",
    "slug": "rogun",
    "lga": "Patigi",
    "delivery_zone": "regional_towns",
    "lat": 8.705,
    "lng": 5.835
  },
  {
    "name": "Rore",
    "slug": "rore",
    "lga": "Irepodun",
    "delivery_zone": "regional_towns",
    "lat": 8.152,
    "lng": 5.068
  },
  {
    "name": "Sabo-Oke, Ilorin",
    "slug": "sabo-oke-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.495,
    "lng": 4.566
  },
  {
    "name": "Sango, Ilorin",
    "slug": "sango-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.5145,
    "lng": 4.576
  },
  {
    "name": "Saw-Mill, Ilorin",
    "slug": "saw-mill-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4745,
    "lng": 4.525
  },
  {
    "name": "Shao",
    "slug": "shao",
    "lga": "Moro",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.585,
    "lng": 4.558
  },
  {
    "name": "Share",
    "slug": "share",
    "lga": "Ifelodun",
    "delivery_zone": "regional_towns",
    "lat": 8.818,
    "lng": 4.968
  },
  {
    "name": "Shiya",
    "slug": "shiya",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 9.142,
    "lng": 3.385
  },
  {
    "name": "Shonga",
    "slug": "shonga",
    "lga": "Edu",
    "delivery_zone": "regional_towns",
    "lat": 9.0167,
    "lng": 5.15
  },
  {
    "name": "Sobi, Ilorin",
    "slug": "sobi-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.538,
    "lng": 4.568
  },
  {
    "name": "Surulere, Ilorin",
    "slug": "surulere-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4845,
    "lng": 4.539
  },
  {
    "name": "Taiwo (Isale & Oke), Ilorin",
    "slug": "taiwo-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4835,
    "lng": 4.5515
  },
  {
    "name": "Tanke (Iledu, Bubu, Tipper Garage), Ilorin",
    "slug": "tanke-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.4795,
    "lng": 4.6025
  },
  {
    "name": "Taoheed Road, Ilorin",
    "slug": "taoheed-road-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.484,
    "lng": 4.588
  },
  {
    "name": "Tsaragi",
    "slug": "tsaragi",
    "lga": "Edu",
    "delivery_zone": "regional_towns",
    "lat": 8.855,
    "lng": 5.012
  },
  {
    "name": "Unilorin Permanent Site (PS), Ilorin",
    "slug": "unilorin-ps-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_outskirts",
    "lat": 8.4815,
    "lng": 4.6745
  },
  {
    "name": "Unity Road, Ilorin",
    "slug": "unity-road-ilorin",
    "lga": "Ilorin South",
    "delivery_zone": "ilorin_metro",
    "lat": 8.483,
    "lng": 4.557
  },
  {
    "name": "Wajibe",
    "slug": "wajibe",
    "lga": "Kaiama",
    "delivery_zone": "regional_towns",
    "lat": 9.385,
    "lng": 4.112
  },
  {
    "name": "Warrah, Ilorin",
    "slug": "warrah-ilorin",
    "lga": "Ilorin West",
    "delivery_zone": "ilorin_metro",
    "lat": 8.462,
    "lng": 4.508
  },
  {
    "name": "Woro",
    "slug": "woro",
    "lga": "Kaiama",
    "delivery_zone": "regional_towns",
    "lat": 9.685,
    "lng": 4.025
  },
  {
    "name": "Yashikira",
    "slug": "yashikira",
    "lga": "Baruten",
    "delivery_zone": "regional_towns",
    "lat": 9.7667,
    "lng": 3.3667
  },
  {
    "name": "Yikpata",
    "slug": "yikpata",
    "lga": "Edu",
    "delivery_zone": "regional_towns",
    "lat": 8.882,
    "lng": 5.048
  },
  {
    "name": "Zango, Ilorin",
    "slug": "zango-ilorin",
    "lga": "Ilorin East",
    "delivery_zone": "ilorin_metro",
    "lat": 8.512,
    "lng": 4.588
  }
] as const;

export function getKwaraLocationBySlug(slug: string): KwaraLocation | undefined {
  return KWARA_LOCATIONS.find((l) => l.slug === slug);
}

export function getKwaraLocationByName(name: string): KwaraLocation | undefined {
  return KWARA_LOCATIONS.find((l) => l.name === name);
}

export function kwaraLocationsByLga(): Record<string, KwaraLocation[]> {
  const map: Record<string, KwaraLocation[]> = {};
  for (const loc of KWARA_LOCATIONS) {
    (map[loc.lga] ??= []).push(loc);
  }
  return map;
}

export function kwaraLocationsByZone(zone: DeliveryZone): KwaraLocation[] {
  return KWARA_LOCATIONS.filter((l) => l.delivery_zone === zone);
}

/** Names suitable for shop.city select when state is Kwara */
export const KWARA_LOCATION_NAMES = KWARA_LOCATIONS.map((l) => l.name);
