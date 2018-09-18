/*
  TODO: bonding

  current issues: 	bonding modifies the data in elementData instead of unique Atom data
					Atom.isBondedTo() doesn't work
					- fix Atom.bond()
					- fix Atom.isBondedTo()
*/
var moleculeMass;
var input;

var polyAtomics;
var eleString;
var ele_raw;
var master_arr;
const elementData = [];

var showAbbr;
var eleCoords;
var res;
var testH, testH2;

var shiftX, shiftY;

function Bond(a1, a2, num){
  this.a1 = a1;
  this.a2 = a2;
  this.num = num;
}
Bond.prototype.changeNum = function(n){
  this.num = n;
};
Bond.prototype.display = function(){
  var midpoint = {x: (this.a1.getX() + this.a2.getX()) / 2, y: (this.a1.getY() + this.a2.getY()) / 2};
  var distance = dist(this.a1.getX(), this.a1.getY(), this.a2.getX(), this.a2.getY());
  var ang = atan2(this.a2.getY() - this.a1.getY(),this.a2.getX() - this.a1.getX());
  push();
  stroke(0,0,0);
  strokeWeight(2);
  for (var i = 0;i<this.num;i++){
    line(midpoint.x - (distance / 4) * cos(ang), midpoint.y - (distance / 4) * sin(ang), midpoint.x - (distance / 4) * cos(ang + 180), midpoint.y - (distance / 4) * sin(ang + 180));
  }
  pop();
}
Bond.prototype.getNum = function(){
  return this.num;
}
Bond.prototype.getA1 = function(){
  return this.a1;
}
Bond.prototype.getA2 = function(){
  return this.a2;
}
function Atom(abbr){
  this.bonds = [];
  this.x = null;
  this.y = null;
  this.setterP = false;
  var rawData = findData(abbr);
  this.data = JSON.parse(JSON.stringify(rawData));//protons, electron configuration, ox. states
  this.id = this.data[0] + atoms.length;
}
Atom.prototype.getBonds = function(){
  return this.bonds;
}
Atom.prototype.getX = function(){
  return this.x;
}
Atom.prototype.getY = function(){
  return this.y;
}
Atom.prototype.getPos = function(){
  return [this.x, this.y];
}
Atom.prototype.getId = function(){
  return this.id;
}
Atom.prototype.canBond = function(){
  if (this.data[0] === "H"){
		console.log(this.id + " has " + this.data[5][0] + " valence electrons");
    return this.data[5][0] !== 2;
  }
  console.log(this.id + " has " + this.data[5][this.data[5].length-1] + " valence electrons");
  return this.data[5][this.data[5].length-1] !== 8;
}
Atom.prototype.getNumBondedTo = function(){//not even sure what this was supposed to do, possibly deprecated due to addition of electron configs
  return this.bonds.length;
}
Atom.prototype.isBondedTo = function(other){//6.4.18 11:23am: doesn't work
  for (var i = 0;i<this.bonds.length;i++){
    if (this.bonds[i].getA2().getId() === other.getId()){
      return true;
    }
  }
  return false;
}
Atom.prototype.getValence = function(){
  return this.data[5][this.data[5].length-1];
};
Atom.prototype.setValence = function(num){
  console.log(this.data);
  this.data[5][this.data[5].length-1] = num;
}
Atom.prototype.bond = function(other, num){
  if (this.canBond() && !this.isBondedTo(other) && other.getId() !== this.getId()){
		this.bonds.push(new Bond(this,other,num));
	  this.setValence(this.getValence() + num);
	  console.log("added " + num + " electrons to " + this.id);
		console.log(this.id + " bonded to " + other.id);
	  if (!other.isBondedTo(this)){
			other.bond(this,num);
	  }
  }
  if (this.canBond() && this.isBondedTo(other) && other.getId() !== this.getId()){
    for (var i = 0;i<this.bonds.length;i++){
      if (this.bonds[i].getA2().getId() === other.getId() && this.bonds[i].getA2().getId() !== num){
        this.bonds[i].changeNum(this.bonds[i].getNum() + 1);
      }
    }
  }
}
Atom.prototype.setX = function(n){
  this.x = n;
}
Atom.prototype.setY = function(n){
  this.y = n;
}
Atom.prototype.setPos = function(newX, newY){
  this.x = newX;
  this.y = newY;
  this.setterP = true;
  eleCoords.push({x: newX, y: newY});
  console.log(this.id + " has been set to (" + this.x + "," + this.y + ")");
}
Atom.prototype.hasSetPos = function(){
  return this.setterP;
}
Atom.prototype.display = function(){
  push();
  var fc = findData(this.data[0])[2];
  fill(fc);
	if (this.data[0] === "O"){
		stroke(0,0,0);
		strokeWeight(1);
	}else{
		noStroke();
	}
  ellipse(this.x,this.y,40*res,40*res);
  if (this.data[0] === "C"){
    fill(255,255,255);
  }else{
    fill(0,0,0);
  }
  textSize(20);
  textAlign(CENTER,CENTER);
  //text(this.id,this.x,this.y)
  for (var i = 0;i<this.bonds.length;i++){
    this.bonds[i].display();
  }
  pop();
}
function findMass(id){//deprecated, will remove later and replace with findData(id)
  for (var i = 0;i<elementData.length;i++){
    if (elementData[i][0] === id){
      return elementData[i][1];
    }
  }
}
function findData(id){
  for (var i = 0;i<elementData.length;i++){
    if (elementData[i][0] === id){
      return elementData[i];
    }
  }
}
function copyData(d){
  var newArray = [];
  for (var i = 0;i<d.length;i++){
    newArray.push(d[i]);
  }
  return newArray;
}
//adapted from Tovask at https://stackoverflow.com/questions/11112321/how-to-save-canvas-as-png-image
function download(){
    document.getElementById("downloader").download = "image.png";
    document.getElementById("downloader").href = document.getElementById("defaultCanvas0").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}
function removeDuplicates(values){
  for (var i = 0;i<values.length;i++){
    for (var j = 0;j<values.length;j++){
      if (i != j && values[i][0] === values[j][0]){
        values[i][1] += values[j][1];
        values[j][1] = 0;
      }
    }
  }
  var newNewArr = [];
  for (var i = 0;i<values.length;i++){
    if (values[i][1] > 0){
      newNewArr.push(values[i]);
    }
  }
  return newNewArr;
}
function addValuesToArray(values, array){
  for (var i = 0;i<values.length;i++){
    array.push(values[i]);
  }
}
function checkForResize(){
  var greatestX = 0;
  var greatestY = 0;
  for (var i = 0;i<eleCoords.length;i++){
    for (var j = 0;j<eleCoords.length;j++){
      if (i !== j){
        var distX = Math.abs(eleCoords[i].x - eleCoords[j].x);
        console.log(distX);

        if (distX > greatestX){
          greatestX = distX;
        }
      }
    }
  }
  for (var i = 0;i<eleCoords.length;i++){
    for (var j = 0;j<eleCoords.length;j++){
      if (i !== j){
        var distY = Math.abs(eleCoords[i].y - eleCoords[j].y);
        if (distY > greatestY){
          greatestY = distY;
        }
      }
    }
  }
  /*console.log("about to resize canvas");
  resizeCanvas(greatestX*1.4+200,greatestY*1.4+200,true);
  console.log(greatestX);
  console.log(greatestY);
  console.log("resized canvas");*/
}
function getComposition(rawr, mult){
  var ele = rawr.split(/(?=[A-Z])/);
  var vals = [];
  for (var i = 0;i<ele.length;i++){
    var strlen = ele[i].length;
    var temporary = [];
    if (isNaN(parseInt(ele[i].substring(strlen-1,strlen)))){
      temporary = [ele[i],mult];
      /*if (eleString.indexOf(ele[i]) == -1){
        alert("Error in processing. Please try again.");
        input = prompt("Enter the chemical formula");
        ele_raw = input.split("(");
      }*/
    }else{
      var len = 1;
      while(!isNaN(parseInt(ele[i].substring(strlen-len-1,strlen)))){
        len++;
      }
      temporary = [ele[i].substring(0,strlen-len),parseInt(ele[i].substring(strlen-len))*mult];
      if (eleString.indexOf(ele[i].substring(0,strlen-len)) == -1){
        alert("Error in processing. Please try again.");
        window.location.reload(true);
      }
    }
    if (eleString.indexOf(ele[i].substring(0,strlen-len)) != -1){
      vals.push(temporary);
    }
  }
  return vals;
}
function Card(data){
  this.data = data;
}
Card.prototype.setPos = function(x, y){
  this.x = x;
  this.y = y;
}
Card.prototype.display = function(){
  push();
  fill(255);
  pop();
}
function coordsIntersect(x, y){
  for (var i = 0;i<eleCoords.length;i++){
    if (Math.round(eleCoords[i].x) === x && Math.round(eleCoords[i].y) === y){
      return true;
    }
  }
  return false;
}
var bondLength;
var atoms;
function setup(){
  createCanvas(displayWidth-400,displayHeight-200);
  bondLength = 80;
  angleMode(DEGREES);
  textAlign(CENTER,CENTER);
  res = 1;
  eleCoords = [];
  showAbbr = false;
  atoms = [];
  eleString = "HHeLiBeBCBOFNeNaMgAlSiPSClArKCa";
  moleculeMass = 0;
  master_arr = [];
  input = prompt("Enter the chemical formula");
  ele_raw = input.split("(");

  elementData.push(["H",1.00794,color(255,0,0),"Hydrogen",1,[1],[-1,1]]);
  elementData.push(["He",4.00260,color(200,136,0),"Helium",2,[2],[0]]);
  elementData.push(["Li",6.941,,"Lithium",3,[2,1],[1]]);
  elementData.push(["Be",9.01218,,"Beryllium",4,[2,2],[2]]);
  elementData.push(["B",10.81,,"Boron",5,[2,3],[3]]);
  elementData.push(["C",12.011,color(0,0,0),"Carbon",6,[2,4],[-4,2,4]]);
  elementData.push(["N",14.0067,color(0,0,255),"Nitrogen",7,[2,5],[-3,-2,-1,1,2,3,4,5]]);
  elementData.push(["O",15.9994,color(255,255,255),"Oxygen",8,[2,6],[-2]]);
  elementData.push(["F",18.9984,color(30,200,30),"Fluorine",9,[2,7],[-1]]);
  elementData[9] = ["Ne",20.180,,"Neon",10,[2,8],[0]];
  elementData[10] = ["Na",22.98977,,"Sodium",11,[2,8,1],[1]];
  elementData[11] = ["Mg",24.305,,"Magnesium",12,[2,8,2],[2]];
  elementData[12] = ["Al",26.98154,,"Aluminum",13,[2,8,3],[3]];
  elementData[13] = ["Si",28.0855,,"Silicon",14,[2,8,4],[-4,2,4]];
  elementData[14] = ["P",30.97376,color(200,20,0),"Phosphorus",15,[2,8,5],[-3,3,5]];
  elementData[15] = ["S",32.065,color(200,200,0),"Sulfur",16,[2,8,6],[-2,4,6]];
  elementData[16] = ["Cl",35.453,color(67,182,219),"Chlorine",17,[2,8,7],[-1,1,5,7]];
  elementData[17] = ["Ar",39.948,,"Argon",18,[2,8,8]];
  elementData[18] = ["K",39.0983,,"Potassium",19,[2,8,8,1]];
  elementData[19] = ["Ca",40.08,,"Calcium",[2,8,8,2]];
  polyAtomics = [//not currently in use
    ["H3O","hydronium",1],
    ["Hg2","mercury (I)",2],
    ["NH4","ammonium",1],
    ["C2H3O2","acetate",-1],
    ["CH3COO","acetate",-1],
    ["CN","cyanide",-1],
    ["CO3","carbonate",-2],
    ["HCO3","hydrogen carbonate",-1],
    ["C2O4","oxalate",-2],
    ["ClO","hypochlorite",-1],
    ["ClO2","chlorite",-1],
    ["ClO3","chlorate",-1],
    ["ClO4","perchlorate",-1],
    ["CrO4","chromate",-2],
    ["Cr2O7","dichromate",-2],
    ["MnO4","permanganate",-1],
    ["NO2","nitrite",-1],
    ["NO3","nitrate",-1],
    ["O2","peroxide",-2],
    ["OH","hydroxide",-1],
    ["PO4","phosphate",-3],
    ["SCN","thiocyanate",-1],
    ["SO3","sulfite",-2],
    ["SO4","sulfate",-2],
    ["HSO4","hydrogen sulfate",-1],
    ["S2O3","thiosulfate",-2]
  ];
  for (var i = 0;i<ele_raw.length;i++){
    var multiplier = 1;
    var cur = ele_raw[i];
    var len = 0;
    if (input.indexOf(")") != -1 && cur.substring(cur.length-1,cur.length) != ")"){
      while (!isNaN(parseInt(cur.substring(cur.length-1-len,cur.length)))){
        len++;
      }
    }
    var closer = cur.indexOf(")");

    if (!isNaN(parseInt(cur.substring(closer+1)))){
      multiplier = parseInt(cur.substring(closer+1));
    }
    if (closer != -1){
      cur = cur.substring(0,closer);
    }
    var n = getComposition(cur,multiplier);
    addValuesToArray(n,master_arr);
  }
  for (var i = 0;i<master_arr.length;i++){
    for (var j = 0;j<master_arr[i][1];j++){
      atoms.push(new Atom(master_arr[i][0]));
    }
  }
  console.log(atoms);

  var display_arr = removeDuplicates(master_arr);
  var indis = [];
  for (var i = 0;i<display_arr.length;i++){
    moleculeMass += display_arr[i][1]*findMass(display_arr[i][0]);
    indis[i] = findMass(display_arr[i][0]);
  }

  var finstr = "";
  for (var i = 0;i<display_arr.length;i++){
    finstr += "<tr><td>"+display_arr[i][0]+"</td><td>"+display_arr[i][1]+"</td><td>"+((indis[i]*display_arr[i][1])/moleculeMass).toFixed(2)+"</td></tr>";
  }

  document.getElementById("t-full").innerHTML += finstr;
  document.getElementById("mass-p").innerHTML = "Gram-formula mass: " + moleculeMass;
  testH = new Atom("H");
  testH2 = new Atom("H");
  testH.bond(testH2,1);
  console.log("testH bonded to testH2: " + testH2.isBondedTo(testH));
  //testH.setPos(width/2,height/2);
  //testH2.setPos(width/2+180,height/2+70);

  for (var i = 0;i<atoms.length;i++){
    console.log("current atom (i): " + atoms[i].getId());
    for (var j = 0;j<atoms.length;j++){
      console.log("\tcurrent atom (j): " + atoms[j].getId());
      if (atoms[i].canBond() && j !== i){
        console.log("\t " + atoms[i].getId() + " can bond");
				if (atoms[j].canBond()){
          console.log("\t " + atoms[j].getId() + " can bond");
					atoms[i].bond(atoms[j],1);
          console.log("\t" + atoms[i].getId() + " just bonded to " + atoms[j].getId());
					if (!atoms[i].hasSetPos()){
						atoms[i].setPos(width/2,height/2);
						console.log("set " + atoms[i].getId() + "'s position");
					}
					if (!atoms[j].hasSetPos()){
						var numBondsI = atoms[i].getNumBondedTo();
						var bondAng = [90,270,0,180];
            var coords = [[atoms[i].getX()+cos(bondAng[0])*bondLength,atoms[i].getY()+sin(bondAng[0])*bondLength],[atoms[i].getX()+cos(bondAng[1])*bondLength,atoms[i].getY()+sin(bondAng[1])*bondLength],[atoms[i].getX()+cos(bondAng[2])*bondLength,atoms[i].getY()+sin(bondAng[2])*bondLength],[atoms[i].getX()+cos(bondAng[3])*bondLength,atoms[i].getY()+sin(bondAng[3])*bondLength]];
						var angToBe = numBondsI-1%4;
            var selector;

            if (!coordsIntersect(coords[angToBe][0],coords[angToBe][1])){
              selector = angToBe;
            }
            if (!coordsIntersect(coords[0][0],coords[0][1])){
              selector = 0;
            }else if (!coordsIntersect(coords[1][0],coords[1][1])){
              selector = 1;
            }else if (!coordsIntersect(coords[2][0],coords[2][1])){
              selector = 2;
            }if (!coordsIntersect(coords[3][0],coords[3][1])){
              selector = 3;
            }
						/*for (var k = 0;k<atoms.length;i++){
						  if (k !== j && atoms[k].hasSetPos()){
                console.log(atoms[k]);
                console.log(atoms[i]);
                console.log(atoms[j]);
							/*if (Math.round(atoms[k].getX()) === Math.round(atoms[i].getX() + cos(bondAng[angToBe]) * bondLength) && Math.round(atoms[k].getY()) === Math.round(atoms[i].getY() + sin(bondAng[angToBe]) * bondLength)){
							  while (Math.round(atoms[k].getX()) === Math.round(atoms[i].getX() + cos(bondAng[angToBe]) * bondLength) && Math.round(atoms[k].getY()) === Math.round(atoms[i].getY() + sin(bondAng[angToBe]) * bondLength)){
								angToBe++;
								if (angToBe === 4){
								  angToBe = 0;
								}
							  }
							}
						  }
						}*/
						atoms[j].setPos(atoms[i].getX()+cos(bondAng[selector])*bondLength, atoms[i].getY() + sin(bondAng[selector]) * bondLength);
						console.log("set " + atoms[j].getId() + " at " + (numBondsI-1)*90 + "deg from " + atoms[i].getId());
					}
				}else{
          console.log("\t\t" + atoms[j].getId() + " has " + atoms[j].data[5][atoms[j].data[5].length-1] + " valence electrons and cannot bond");
				}
      }else{
        console.log("\t" + atoms[i].getId() + " has " + atoms[i].data[5][atoms[i].data[5].length-1] + " valence electrons and cannot bond");
			}
    }
  }
  for (var i = 0;i<atoms.length;i++){
    for (var j = 0;j<atoms.length;j++){
       if (i !== j && atoms[i].canBond() && atoms[j].canBond()){
        atoms[i].bond(atoms[j],1);
       }
    }
  }
	for (var i = 0;i<atoms.length;i++){
		if (!atoms[i].hasSetPos()){
			document.getElementById("warning-DNE").innerHTML = "<p>Molecule cannot be drawn</p>";
		}
	}
  var leastX = displayWidth;
  var greatestX = 0;
  var leastY = displayHeight;
  var greatestY = 0;
  for (var i = 0;i<eleCoords.length;i++){
    if (eleCoords[i].x < leastX){
      leastX = eleCoords[i].x;
    }
    if (eleCoords[i].x > greatestX){
      greatestX = eleCoords[i].x;
    }
    if (eleCoords[i].y < leastY){
      leastY = eleCoords[i].y;
    }
    if (eleCoords[i].y > greatestY){
      greatestY = eleCoords[i].y;
    }
  }
  shiftX = ((greatestX - width) + (leastX))/ 2;
  shiftY = ((greatestY - height) + (leastY))/ 2;;
  console.log(shiftX);
  console.log(shiftY);
  /*for (var i = 0;i<atoms.length;i++){
  var a = atoms[i];
    for (var j = 0;j<atoms[i].getBonds().length;i++){
      console.log(a.getId() + " is bonded to " + a.getBonds()[j]);
    }
  }*/
  //checkForResize();
}

function draw(){
  background(255);
  push()
  translate(-shiftX, -shiftY);
  //var t = Math.min(millis()/2000,atoms.length);
  for (var i = 0;i<atoms.length;i++){
		if (atoms[i].hasSetPos()){
			atoms[i].display();
		}
  }
  pop();
  fill(0,0,0);
  textSize(25);
  text(input,width/2, 80);
}
