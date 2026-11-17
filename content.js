/* Contenido SOLO del host (pistas y resumen), en euskera. Orden de pistas: beldurra → nahia → esaldia → ahots-tonua → jokabidea. */
const CONTENT = {
  rebel: {
    clues: { eu: [
      'Sentitzea ezin duela ezer egin, egiten duenak ezer ez aldatzea.',
      'Ez dabilena apurtu eta beste zerbait hasi.',
      '«Arauak gaur gauean hemen ez dagoen norbaitek idatzi zituen.»',
      'Zuzena, lehorra, apaingarririk gabea. Nahita probokatzen du eta ez du barkamenik eskatzen.',
      'Musika aldatzen du inori galdetu gabe, besteek bezala ez du dantzatzen eta arauak hausten ditu.'
    ] },
    diff: { eu: 'Arauak aldatzeko haustzen ditu (xedea). Bufoiak ere haustzen ditu, baina ondo pasatzeko; magoak eraldatzen du, baina txunditzeko, ez apurtzeko. Bere beldurra: botererik ez izatea.' }
  },
  magician: {
    clues: { eu: [
      'Truku batek txarto ateratzea eta inork espero ez zituen ondorioak izatea.',
      'Ezinezkoa zirudiena egia bihurtzea.',
      '«Eman minutu bat eta gau hau ez duzu ezagutuko.»',
      'Misteriotsua, patxadatsua, inspiratzailea. Sekretu bat gordetzen duenak bezala hitz egiten du.',
      'Konfetiak botatzen ditu eta giroa eraldatzen du.'
    ] },
    diff: { eu: 'Harridurarekin eta ikuspegiarekin eraldatzen du: ezinezkoa egia bihurtzen du. Errebeldeak suntsituz aldatzen du; bufoiak unea bilatzen du soilik. Bere beldurra: ustekabeko ondorioak.' }
  },
  caregiver: {
    clues: { eu: [
      'Berekoia izatea, edo inork ez baloratzea eman duena.',
      'Guztiak ondo eta seguru egotea.',
      '«Zerbait jan duzu? Hartu, edan ur pixka bat, gero ez zara akordatuko.»',
      'Beroa, lasaia, babeslea. Baieztatu baino galdera gehiago egiten ditu.',
      'Edariak eskaintzen ditu eta denak ondo daudela begiratzen du.'
    ] },
    diff: { eu: 'Besteengatik mugitzen da, ez bere buruarengatik: babesten eta zaintzen du. Beste hirurek aldatzeko, txunditzeko edo dibertitzeko jokatzen dute; zaintzaileak, inor gaizki ez gelditzeko. Bere beldurra: berekoikeria eta esker txarra.' }
  },
  jester: {
    clues: { eu: [
      'Aspertzea… edo okerrago, aspergarria izatea.',
      'Orain bertan ondo pasatzea, eta besteek ere bai.',
      '«Honetaz barre egiten ez badugu, zeri egingo diogu barre?»',
      'Azkarra, jostalaria, begi-kliskaz. Ez da ezer larria.',
      'Arraro dantzatzen du eta kolpe barregarriak ematen ditu.'
    ] },
    diff: { eu: 'Oraina bizi du eta ondo pasatzen eta pasarazten du. Errebeldeak ere probokatzen du, baina kausa batengatik; bufoiak jokoagatik. Bere beldurra: aspertzea edo aspergarria izatea.' }
  }
};

/* ---------- DIAPOSITIVAS (parte teórica tras el juego) ----------
   Datos de cada arketipo: de los apuntes de la profesora (02.3 Arketipoak).
   "why": por qué hemos elegido ese meme. Editad libremente. */
const SLIDE_ORDER = ['jester', 'magician', 'caregiver', 'rebel'];
const SLIDES = {
  jester: {
    group: 'Kidetasuna eta gozamena', tag: 'Unea gozatzea',
    want: 'Ondo pasatzea, barre eragitea', fear: 'Aspertzea', voice: 'Ironikoa, absurdoa, azkarra',
    look: 'Kolore saturatuak, maskotak, memeak, tipografia lodia',
    brands: 'Duolingo · Fanta · Old Spice',
    memeCap: 'Diskotekan dantzan, eguzkitako betaurrekoekin',
    why: [
      'Unean bizi da: dantzatu eta kito. Ez du ezer serio hartzen.',
      'Erridikulua egitea ez zaio inporta: barre eragiten du eta ondo pasatzen du.',
      'Memea bera bufoiaren hizkuntza da: teoriak dioenez, memeak dira haren estetikaren parte.'
    ]
  },
  magician: {
    group: 'Maisutasuna eta arriskua', tag: 'Ezinezkoa egia bihurtzea',
    want: 'Errealitatea eraldatzea', fear: 'Ustekabeko ondorioak', voice: 'Inspiratzailea, misteriotsua',
    look: 'Moreak eta gau-urdina, distirak, degradatuak, aurretik eta ondoren',
    brands: 'Disney · Absolut · Dyson',
    memeCap: 'Txakur bat DJ, diskoteka jendez beteta',
    why: [
      'Ezinezkoa egia bihurtzen du: txakur bat DJ da eta jendea eskuak altxata dago.',
      'Giroa eraldatzen du: musikarekin, argiekin eta jendearekin.',
      'Estetika bat dator: gau-iluna, diskoko bolaren distirak eta txundituta dagoen jendea.'
    ]
  },
  caregiver: {
    group: 'Egonkortasuna eta kontrola', tag: 'Besteak babestea',
    want: 'Zaintzea, laguntzea', fear: 'Berekoikeria, eskergabekeria', voice: 'Beroa, lasaigarria',
    look: 'Urdin leunak eta berdeak, eskuak, familiak, besarkatzen duten formak',
    brands: 'Johnson & Johnson · Unicef · Mapfre',
    memeCap: 'Zuriz jantzitako figura bat, edaria eskainiz eta jendez inguratuta',
    why: [
      'Besteen erdian dago eta guztiek hurbiltzen zaizkio: denak ondo sentiarazten ditu.',
      'Edaria eskaintzen du eta denak ondo daudela begiratzen du: zaintza keinua.',
      'Irribarre beroa, esku zabalak eta giro lasaigarria: arketipo honen itxura bera.'
    ]
  },
  rebel: {
    group: 'Maisutasuna eta arriskua', tag: 'Arauak haustea',
    want: 'Funtzionatzen ez duena aldatzea', fear: 'Beste bat gehiago izatea, garrantzirik ez izatea', voice: 'Probokatzailea, iragazkirik gabea',
    look: 'Beltza, neoia, testurak, collagea, display edo tipografia hautsia',
    brands: 'Harley-Davidson · Liquid Death · Desigual',
    memeCap: 'DJ andre zaharra, betaurreko beltzekin',
    why: [
      'Arauak hausten ditu: «DJ-ak gazteak dira» ideia apurtzen du, funtzionatzen ez duena aldatuz.',
      'Jarrera probokatzailea eta iragazkirik gabea: keinuak, betaurreko beltzak, barkamenik gabe.',
      'Musika berak jartzen du, inori galdetu gabe.'
    ]
  }
};
