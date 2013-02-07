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
			var maxBASS = liste[0].bass,
				minBASS = liste[liste.length-1].bass;
			
			var width = 400,
				height = (maxBASS - minBASS) * 20 + 50;
				
			var container = d3.select("#frame-classement").append("svg:svg")
							.attr("width", width)
							.attr("height", height);
			
			container.append("svg:line")
				.attr("x1", width/2)
				.attr("y1", 25)
				.attr("x2", width/2)
				.attr("y2", height - 25)
				.attr("stroke-width", 2)
				.attr("stroke", "black");
				
			
			var positionContainer = container.selectAll("g")
					.data(liste)
						.enter().append("svg:g")
						.on("mouseover", mover)
						.on("mouseout", mout);
			
			positionContainer.append("svg:line")
						.attr("x1", width/2 - 5)
						.attr("y1", function(d, i) { return (maxBASS-d.bass) * 20 + 25;})
						.attr("x2", width/2 + 5)
						.attr("y2", function(d, i) { return (maxBASS-d.bass) * 20 + 25;})
						.attr("stroke-width", 2)
						.attr("stroke", "black");
						
			positionContainer.append("svg:text")
						.attr("x", function(d, i) { return width/2 + Math.pow(-1, i) * 10})
						.attr("y", function(d, i) { return (maxBASS-d.bass) * 20 + 25;})
						.text(function(d, i) { return "#"+(i+1)+" : "+d.nom + " ("+Math.ceil(d.bass)+")";})
						.style("dominant-baseline", "central")
						.style("text-anchor", function(d, i) { return Math.pow(-1, i) > 0 ? "start" : "end";})
						.style("font-size", "12px");
						
			function mover() {
				positionContainer.selectAll("text").style("fill", "lightgray");
				positionContainer.selectAll("line").attr("stroke", "lightgray");
				d3.select(this).select("text").style("fill", "black");
				d3.select(this).select("line").attr("stroke", "black");
			}
			
			function mout() {
				positionContainer.selectAll("text").style("fill", "black");
				positionContainer.selectAll("line").attr("stroke", "black");
			}

		});
	});
}
