/* Datos compartidos (host + jugadores). Solo euskera. NO contiene las pistas: esas están solo en content.js (host). */
const ROOM_PREFIX = 'idarte-mkt-';
const PTS = [1000, 800, 600, 400, 200];   // puntos según la pista en la que se acierta
const CLUE_SECS = 16;                      // segundos entre pista y pista (5 pistas = 80 s por ronda)

const ARCH = [
  { id: 'hero',      eu: 'Heroia' },
  { id: 'rebel',     eu: 'Errebeldea' },
  { id: 'innocent',  eu: 'Errugabea' },
  { id: 'friend',    eu: 'Laguna' },
  { id: 'lover',     eu: 'Maitalea' },
  { id: 'magician',  eu: 'Magoa' },
  { id: 'sage',      eu: 'Jakintsua' },
  { id: 'ruler',     eu: 'Agintaria' },
  { id: 'jester',    eu: 'Bufoia' },
  { id: 'creator',   eu: 'Sortzailea' },
  { id: 'explorer',  eu: 'Esploratzailea' },
  { id: 'caregiver', eu: 'Zaintzailea' }
];
function archName(id, lang) { return ARCH.find(a => a.id === id)[lang]; }
function sortedArch(lang) { return [...ARCH].sort((a, b) => a[lang].localeCompare(b[lang], lang)); }

const T = {
  eu: {
    title: 'Arketipoen festa',
    // host
    joinAt: 'Sartu', codeLbl: 'Kodea', start: 'Hasi',
    nextClue: 'Hurrengo pista ▸', seeAnswer: 'Erantzuna ▸', nextRound: 'Hurrengo erronda ▸',
    seeRank: 'Sailkapena ▸', seeRecap: 'Teoria ▸', nextSlide: 'Hurrengoa ▸', again: 'Berriz ↻', prevSlide: '◂ Atzera',
    sWant: 'Zer nahi du', sFear: 'Zeri beldur dio', sVoice: 'Nola hitz egiten du', sLook: 'Nolako itxura du', sBrands: 'Markak', sWhy: 'Zergatik meme hau?', sGroup: 'Motibazioa',
    watch: 'Begiratu memeari… zein arketipo da?',
    round: 'Erronda', answered: 'erantzun dute', answersTitle: 'Gelaren erantzunak', topTitle: 'Sailkapena',
    podium: 'Irabazleak', fear: 'Beldurra', desire: 'Nahia', voice: 'Ahots-tonua', diff: 'Zerk bereizten du?',
    hit: 'asmatu dute', confused: 'Gehien nahastu da', netOk: 'Konektatuta', netErr: 'Ez dago konexiorik',
    players: 'jokalari', pts: 'puntu', now: 'Orain', noneWrong: 'inork ez',
    // jugador
    yourName: 'Zure izena', code: 'Gela-kodea', join: 'Sartu', inside: 'Barruan zaude!', wait: 'Itxaron, laster hasiko da…',
    look: 'Begiratu pantaila nagusiari', pick: 'Zein arketipo da?', lock: 'Blokeatu erantzuna', locked: 'Erantzuna bidalita. Itxaron…',
    right: 'Asmatu duzu!', wrong: 'Ez da hori…', noAnswer: 'Ez duzu erantzun', itWasP: 'Zen:', place: 'Postua', end: 'Jokoa amaitu da',
    endSub: 'Begiratu pantaila nagusiari', connecting: 'Konektatzen…', fail: 'Ezin izan da konektatu. Egiaztatu kodea eta saiatu berriro.',
    clueLbl: ['Beldurra', 'Nahia', 'Esaldia', 'Ahots-tonua', 'Jokabidea']
  }
};
