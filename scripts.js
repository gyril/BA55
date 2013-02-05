function loadView(id) {
	var frame = document.getElementById("frame");
	for(var i in frame.children)
		if(typeof frame.children[i].style != "undefined")
		frame.children[i].style.display = "none";
		
	document.getElementById("frame-"+id).style.display = "block";
}

function autoComplete(input) {
	var ac = document.getElementById("autocomplete").style;
	ac.visibility = "visible";
	ac.top = (input.offsetTop+input.offsetHeight)+"px";
	ac.left = input.offsetLeft+"px";
	ac.width = input.offsetWidth+"px";
}

function hideAutoComplete() {
	var ac = document.getElementById("autocomplete");
	ac.style.visibility="hidden";
	ac.setAttribute("data-index", -1);
	while(ac.firstChild)
		ac.removeChild(ac.firstChild);
	
}

function refreshAutoComplete(input, key) {
	var ac = document.getElementById("autocomplete");
	var idx = parseInt(ac.getAttribute("data-index"));

	if(key.keyIdentifier == "Up" || key.keyIdentifier == "Down") {
		if(idx != -1)
			ac.children[idx].style.backgroundColor = "";
			
		idx = key.keyIdentifier == "Down" ? (idx==ac.children.length-1 ? ac.children.length-1 : idx+1) : (idx==0 ? 0 : idx-1);
		ac.children[idx].style.backgroundColor = "lightgray";
		ac.setAttribute("data-index", idx);
		input.value = ac.children[idx].innerText;
		return;
	}
	
	while(ac.firstChild)
		ac.removeChild(ac.firstChild);
	
	if(input.value.length < 1) {
		ac.setAttribute("data-index", -1);
		return;
	}
	
	for(var i in liste)
		(function(i) {
			if(liste[i]['nom'].toLowerCase().indexOf(input.value.toLowerCase()) > -1) {
				var nom = document.createElement("div");
				nom.innerText = liste[i]['nom'];
				nom.addEventListener("mousedown", function() {
					input.value = liste[i]['nom'];
					ac.setAttribute("data-index", -1);
				}, false);
				ac.appendChild(nom);
			}
		})(i);
		
	if(key.keyCode == 13 && idx >= 0) {
		input.value = ac.children[idx].innerText;
		while(ac.firstChild)
			ac.removeChild(ac.firstChild);
		ac.setAttribute("data-index", -1);
	}
}

function loadHistorique() {
	document.getElementById("frame-historique").removeChild(document.getElementById("frame-historique").firstChild);
	
	d3.json("./matchs.json", function(data) {
		var table = document.createElement("table");
		table.classList.add("tableau");
		var h = document.createElement("tr");
		var hg1 = document.createElement("td");
		hg1.innerHTML = "<strong>Gagnant #1</strong>";
		var hg2 = document.createElement("td");
		hg2.innerHTML = "<strong>Gagnant #2</strong>";
		var hp1 = document.createElement("td");
		hp1.innerHTML = "<strong>Perdant #1</strong>";
		var	hp2 = document.createElement("td");
		hp2.innerHTML = "<strong>Perdant #2</strong>";
		
		h.appendChild(hg1);
		h.appendChild(hg2);
		h.appendChild(hp1);
		h.appendChild(hp2);
		table.appendChild(h);
		
		for(var i=data.length-1; i>=0; i--) {
			var tr = document.createElement("tr");
			
			var g1 = document.createElement("td");
			g1.innerText = data[i]['m']['g1'];
			tr.appendChild(g1);
			var g2 = document.createElement("td");
			g2.innerText = data[i]['m']['g2'];
			tr.appendChild(g2);
			var p1 = document.createElement("td");
			p1.innerText = data[i]['m']['p1'];
			tr.appendChild(p1);
			var p2 = document.createElement("td");
			p2.innerText = data[i]['m']['p2'];
			tr.appendChild(p2);
			
			table.appendChild(tr);
		}
		
		document.getElementById("frame-historique").appendChild(table);
	});
}

function loadEvolution() {
	window.liste = [];
	document.getElementById("frame-classement").removeChild(document.getElementById("frame-classement").firstChild);
	
	d3.json("./historique.json", function(data) {
		var joueurs = data;
		
		d3.json("./joueurs.json", function(scores) {
			for(var i in scores) {
				if(typeof joueurs[i] == "undefined")
					joueurs[i] = [scores[i]];
				else joueurs[i].push(scores[i]);
			}
						
			for(var i in joueurs)
				liste.push({nom: i, scores: joueurs[i], bass: scores[i].mu - 2*scores[i].sigma});
			
			function rank(a, b) {
				return b.bass - a.bass;
			}
	
			liste.sort(rank);
			console.log(liste);
			
			var width = 400,
				height = (liste.length * 25) + 100;
				
			var container = d3.select("#frame-classement").append("svg:svg")
							.attr("width", width)
							.attr("height", height);
			
			var joueurContainer = container.selectAll("g")
					.data(liste)
					.enter().append("svg:g")
					.attr("transform",function(d,i) {return "translate(100,"+(i * 25 + 50) +")";})
					.attr("class","joueur");
			  
			  // Append rank

				joueurContainer.append("svg:text")
					.text(function(d, i) {return i + 1;})
					.attr("x",10);
					
				// Append name
			  
				joueurContainer.append("svg:text")
					.text(function(d) {return d.nom;})
					.attr("x",50);
					
				// Append last BASS
			  
				joueurContainer.append("svg:text")
					.text(function(d) {return Math.ceil(d.bass);})
					.attr("x",150);
					
				var containerTitle = container.append("svg:g")
						.attr("transform","translate(100,25)")
						.attr("class","title");
						
				containerTitle.append("svg:text")
						.text("rank")
						.attr("x",10);
						
				containerTitle.append("svg:text")
						.text("name")
						.attr("x",50);
						
				containerTitle.append("svg:text")
						.text("BASS")
						.attr("x",150);

		});
	});
}
