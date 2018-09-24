/*
  TODO: bonding

  current issues: 	bonding modifies the data in elementData instead of unique Atom data
					Atom.isBondedTo() doesn't work
					- fix Atom.bond()
					- fix Atom.isBondedTo()
*/
var moleculeMass;
var input;
var selected = [];

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
  var midpoint = {x: (this.a1.getPos2D().x + this.a2.getPos2D().x) / 2, y: (this.a1.getPos2D().y + this.a2.getPos2D().y) / 2};
  var distance = dist(this.a1.getPos2D().x, this.a1.getPos2D().y, this.a2.getPos2D().x, this.a2.getPos2D().y);
  var ang = atan2(this.a2.getPos2D().y - this.a1.getPos2D().y, this.a2.getPos2D().x - this.a1.getPos2D().x);
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
  this.pos2D = {x: null, y: null};
  this.pos3D = {x: null, y: null, z: null};
  var rawData = findData(abbr);
  this.data = JSON.parse(JSON.stringify(rawData));//protons, electron configuration, ox. states
  this.id = this.data[0] + atoms.length;
}
Atom.prototype.getBonds = function(){
  return this.bonds;
}
Atom.prototype.getPos2D = function(){
  return this.pos2D;
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
Atom.prototype.setPos2D = function(newX, newY){
  this.pos2D.x = newX;
  this.pos2D.y = newY;
  eleCoords.push({x: newX, y: newY});
  console.log(this.id + " has been set to (" + this.pos2D.x + "," + this.pos2D.y + ")");
}
Atom.prototype.setPos3D = function(newX, newY, newZ){
  this.pos3D.x = newX;
  this.pos3D.y = newY;
  this.pos3D.z = newZ;
}
Atom.prototype.hasSetPos2D = function(){
  return this.pos2D.x != null && this.pos2D.y != null;
}
Atom.prototype.hasSetPos3D = function(){
  return this.pos3D.x != null && this.pos3D.y != null && this.pos3D.z != null;
}
Atom.prototype.hover2D = function(){
  return dist(mouseX, mouseY, this.pos2D.x + width / 2, this.pos2D.y + height / 2) < res * 40;
}
Atom.prototype.display2D = function(){
  push();
  var fc = findData(this.data[0])[2];
  fill(fc);
	if (this.data[0] === "O"){
		stroke(0,0,0);
		strokeWeight(1);
	}else{
		noStroke();
	}
  ellipse(this.pos2D.x,this.pos2D.y,40*res,40*res);
  if (this.data[0] === "C"){
    fill(255,255,255);
  }else{
    fill(0,0,0);
  }
  textSize(20);
  textAlign(CENTER,CENTER);
  text(this.id,this.pos2D.x,this.pos2D.y)
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
var toasts = [];
function download(){
    var duration = 5000;
    var toaster = document.getElementById("toaster");
    var newToast = document.createElement("div");
    newToast.innerHTML = "<div class=\"toast toast-success\">Image downloaded</div>";
    newToast.classList.add("toast");
    newToast.classList.add("toast-success");
    newToast.classList.add("animated");
    newToast.classList.add("0.5s");
    newToast.classList.add("zoomInUp");
    document.getElementById("downloader").download = "image.png";
    document.getElementById("downloader").href = document.getElementById("defaultCanvas0").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    setTimeout(function(){
      newToast.classList.remove("animated");
      newToast.classList.remove("0.5s");
      newToast.classList.remove("zoomInUp");
      newToast.classList.add("animated");
      newToast.classList.add("1.5s");
      newToast.classList.add("fadeOut");
      //newToast.style.display = "none";
    },duration);
    if (toaster.childNodes.length < 3){
      toaster.appendChild(newToast);
      setTimeout(function(){
        toaster.removeChild(newToast);
      },duration+1500);
    }
}
function showToast(){

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
function openTab(tabr, act){
  var tabrs = document.getElementsByClassName("tab-result");
  var tabs = document.getElementsByClassName("tab-item");
  console.log(1);
  for (var i = 0;i<tabrs.length;i++){
    tabrs[i].style.display = "none";
    console.log("a");
  }
  for (var i = 0;i<tabs.length;i++){
    if (tabs[i].classList.contains("active")){tabs[i].classList.remove("active");}
    console.log(tabs[i].classList);
  }
  for (var i = 0;i<tabs.length;i++){
    console.log(tabs[i].classList);
  }

  act.currentTarget.classList.add("active");
  document.getElementById(tabr).style.display = "inline-block";
  console.log("done");
}
var bondLength;
var atoms;
var molName;
function setup(){
  var ww = ((windowWidth * 2/3 > 1000) ? windowWidth * 2/3 : 1000);
  var wh = 600;
  createCanvas(ww,wh);
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


  var display_arr = (master_arr);
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
function updateComp(){

}
function addAtom(){
  var a = document.getElementById("selector").value;
  if (a !== "Choose an atom"){
    if (atoms.length == 0){
      atoms.push(new Atom(a));
      updateComp();
      atoms[0].setPos2D(0,0);
      atoms[0].setPos3D(0,0,0);
      console.log(a);
    }else{

    }
  }
}
function draw(){
  molName = document.getElementById("name").value;
  var subscript = [], upper = [];
  /*for (var i = 0;i<molName.length;i++){
    if (!isNaN(molName.substr(i,1))){
      subscript.push(molName.substr(i,1));
      upper.push(" ");
    }else{
      subscript.push(" ");
      upper.push(molName.substr(i,1));
    }
  }*/
  background(255,255,255);
  fill(255);
  stroke(0);
  rect(0,0,width-2,height-2);
  push();
  translate(width/2, height/2);
  //var t = Math.min(millis()/2000,atoms.length);
  for (var i = 0;i<atoms.length;i++){
		if (atoms[i].hasSetPos2D()){
      if (atoms[i].hover2D() && mouseIsPressed){
        if (!selected.includes(atoms[i])){
          selected.push(atoms[i]);
          mouseIsPressed = false;
          console.log(atoms[i].getId() + " selected");
        }
      }
			atoms[i].display2D();
      console.log("displayed");
		}
  }
  if (selected.length > 2){
    selected = selected.slice(selected.length-3,selected.length-1);
  }
  push();
  noFill();
  stroke(0,0,0);
  strokeWeight(4);
  for (var i = 0;i<selected.length;i++){
    ellipse(selected[i].getPos2D().x,selected[i].getPos2D().y,40*res,40*res);
  }
  pop();
  pop();
  fill(0,0,0);
  textSize(25);
  /*text(upper,width/2, 80);
  for (var i = 0;i<upper.length;i++){
    text(upper[i],width/2-(i-upper.length/2)*25,80);
    text(subscript[i],width/2-(i-upper.length/2)*25,85);
  }*/
  //text("1234567890",width/2,100);
  text(molName,width/2,85);
  ellipse(100,100,40,40);
}
