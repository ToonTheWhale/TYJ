function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png" style="filter: brightness(0) saturate(100%); width: 25px; hight: 25px">`
            b.innerHTML += "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.addEventListener("click", function(e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                // submit the form
                document.getElementById("myForm-guessPoke").submit();
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) { 
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
  
var countries = 
  ['bulbasaur',  'ivysaur',    'venusaur',   'charmander', 'charmeleon',
  'charizard',  'squirtle',   'wartortle',  'blastoise',  'caterpie',
  'metapod',    'butterfree', 'weedle',     'kakuna',     'beedrill',
  'pidgey',     'pidgeotto',  'pidgeot',    'rattata',    'raticate',
  'spearow',    'fearow',     'ekans',      'arbok',      'pikachu',
  'raichu',     'sandshrew',  'sandslash',  'nidoran-f',  'nidorina',
  'nidoqueen',  'nidoran-m',  'nidorino',   'nidoking',   'clefairy',
  'clefable',   'vulpix',     'ninetales',  'jigglypuff', 'wigglytuff',
  'zubat',      'golbat',     'oddish',     'gloom',      'vileplume',
  'paras',      'parasect',   'venonat',    'venomoth',   'diglett',
  'dugtrio',    'meowth',     'persian',    'psyduck',    'golduck',
  'mankey',     'primeape',   'growlithe',  'arcanine',   'poliwag',
  'poliwhirl',  'poliwrath',  'abra',       'kadabra',    'alakazam',
  'machop',     'machoke',    'machamp',    'bellsprout', 'weepinbell',
  'victreebel', 'tentacool',  'tentacruel', 'geodude',    'graveler',
  'golem',      'ponyta',     'rapidash',   'slowpoke',   'slowbro',
  'magnemite',  'magneton',   'farfetchd',  'doduo',      'dodrio',
  'seel',       'dewgong',    'grimer',     'muk',        'shellder',
  'cloyster',   'gastly',     'haunter',    'gengar',     'onix',
  'drowzee',    'hypno',      'krabby',     'kingler',    'voltorb'];
  
autocomplete(document.getElementById("myInput-guessPoke"), countries);