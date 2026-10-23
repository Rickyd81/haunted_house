# Villa Morgrave

Metroidvania 2D gotico in pixel art, giocabile nel browser (HTML5 + JavaScript, nessuna dipendenza).

Un Cavaliere della Veglia esplora una villa infestata dai non morti: 42 stanze in 6 aree, 8 armi da sbloccare, progressione GDR, 5 custodi più il boss finale, passaggi segreti e una mappa che si rivela man mano.

## Come giocare

Apri `dist/index.html` nel browser (oppure pubblica la cartella con GitHub Pages).

| Tasto | Azione |
|---|---|
| Frecce / WASD | Muovi |
| Z / Spazio / Su | Salta (in aria: doppio salto, quando sbloccato) |
| Giù + salto | Scendi dalle travi di legno |
| X / J | Attacca |
| C / K / Maiusc | Scatto (sbloccabile) |
| Q / E | Cambia arma |
| F | Bevi una pozione |
| M | Mappa |
| Invio / Esc | Diario (statistiche e armi) |
| N | Audio on/off |

Su telefono e tablet compaiono i comandi touch.

## Contenuti

- **Aree**: Atrio dei Sussurri, Biblioteca Proibita, Cripte di Famiglia, Cappella Sconsacrata, Torre del Corvo, Santuario del Necromante.
- **Boss**: Ossian il Maggiordomo Scheletrico, Morwen la Strega dei Libri, Gorvath il Ghoul dell'Ossario, Isolde la Sposa Spettrale, Sir Aldric il Cavaliere Decaduto, e il Conte Malachia (finale, a due fasi).
- **Armi**: Spada, Ascia, Lancia, Balestra, Catena, Falce, Martello Consacrato, Lama del Crepuscolo.
- **GDR**: livelli con aumento di PV, Forza, Difesa e Fortuna; colpi critici; i nemici crescono di livello a ogni custode sconfitto.
- **Esplorazione**: muri fragili che nascondono 6 stanze segrete, barriere spettrali, cancelli che si aprono con gli Emblemi, altari che curano e salvano (salvataggio nel browser).

## Struttura

```
src/shell.html      markup e stile della pagina
src/js/01-core.js   costanti, utilità, input
src/js/02-world.js  aree, stanze, collegamenti, armi, oggetti, generazione stanze
src/js/03-audio.js  effetti sonori e musica sintetizzati (WebAudio)
src/js/04-game.js   fisica, giocatore, nemici, proiettili, stanze, ricompense
src/js/05-bosses.js IA dei 6 boss
src/js/06-render-room.js  disegno delle stanze e degli arredi gotici
src/js/07-sprites.js      sprite pixel art di eroe, armi, nemici, boss
src/js/08-ui.js     luci, HUD, mappa, menu
src/js/09-main.js   ciclo di gioco
build.py            unisce tutto in dist/index.html
```

Dopo aver modificato `src/`, esegui `python3 build.py` per rigenerare `dist/index.html`.
