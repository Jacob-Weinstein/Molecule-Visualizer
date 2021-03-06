/*
  TODO: bonding

  current issues: 	bonding modifies the data in elementData instead of unique Atom data
					Atom.isBondedTo() doesn't work
					- fix Atom.bond()
					- fix Atom.isBondedTo()
*/
var moleculeMass;
var nodes = [];
var input;
var selected;
var duration = 5000, grit = 18;
var bonds3D = [];

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
  this.displayed = false;
  this.len = a1.data[7][num-1]+a2.data[7][num-1];
  console.log(this.len);
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


  translate(this.a2.pos2D.x,this.a2.pos2D.y);
  rotate(ang+90);
  for (var i = 0;i<this.num;i++){
    //display lines for tentative bonds
    //line(selected.pos2D.x+cos(aaang)*20+i*10, selected.pos2D.y+sin(aaang)*20+i*10, selected.pos2D.x+cos(aaang)*80+i*10, selected.pos2D.y+sin(aaang)*80+i*10);
    line(-this.num/2*5+10*i,20,-this.num/2*5+10*i,/*20+this.len/2*/80);
  }

  pop();
  this.displayed = true;
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
  //this.bonds = [];
  this.pos2D = {x: null, y: null};
  this.pos3D = {x: null, y: null, z: null};
  var rawData = findData(abbr);
  this.data = JSON.parse(JSON.stringify(rawData));//protons, electron configuration, ox. states
  this.id = this.data[0] + atoms.length;
}
Atom.prototype.getId = function(){
  return this.id;
}
Atom.prototype.getMass = function(){
  return this.data[1];
}
Atom.prototype.getBonds = function(){
  var b = [];
  for (var i = 0;i<bonds.length;i++){
    if (bonds[i].getA1().getId() === this.id || bonds[i].getA2().getId() === this.id){
      b.push(bonds[i]);
    }
  }
  return b;
}
Atom.prototype.getPos2D = function(){
  return this.pos2D;
}
Atom.prototype.getId = function(){
  return this.id;
}
Atom.prototype.canBond = function(b){
  if (this.data[0] === "H" || this.data[0] === "He"){
		//console.log(this.id + " has " + this.data[5][0] + " valence electrons");
    return (this.data[5][0] + b) <= 2;
  }
  //console.log(this.id + " has " + this.data[5][this.data[5].length-1] + " valence electrons and " + (this.data[5][this.data[5].length-1]+b));
  return (this.data[5][this.data[5].length-1] + b) <= 8;
}
Atom.prototype.getNumBondedTo = function(){//not even sure what this was supposed to do, possibly deprecated due to addition of electron configs
  return this.getBonds().length;
}
Atom.prototype.isBondedTo = function(other){//6.4.18 11:23am: doesn't work
  var bs = this.getBonds();
  for (var i = 0;i<bs.length;i++){
    if (bs[i].getA2().getId() === other.getId() || bs[i].getA1().getId() === other.getId()){
      return true;
    }
  }
  return false;
}
Atom.prototype.getValence = function(){
  return this.data[5][this.data[5].length-1];
};
Atom.prototype.setValence = function(num){
  //console.log(this.data);
  this.data[5][this.data[5].length-1] = num;
}
Atom.prototype.bond = function(other, num){
  if (this.canBond(num) && this.isBondedTo(other) && other.getId() !== this.getId()){
    var temp;
    for (var i = 0;i<bonds.length;i++){
      if (bonds[i].getA2().getId() === other.getId() || bonds[i].getA1().getId() === other.getId()){
        temp = bonds[i];
        //bonds[i].changeNum(this.getBonds()[i].getNum() + 1);
      }
    }
    temp.changeNum(temp.getNum()+1);
  }
  if (this.canBond(num) && !this.isBondedTo(other) && other.getId() !== this.getId()){
		bonds.push(new Bond(this,other,num));
    console.log(bonds);
	  this.setValence(this.getValence() + num);
    other.setValence(other.getValence() + num);
	  console.log("added " + num + " electrons to " + this.id);
		console.log(this.id + " bonded to " + other.id);
	  /*if (!other.isBondedTo(this)){
			other.bond(this,num);
	  }*/
  }

}
Atom.prototype.setPos2D = function(newX, newY){
  this.pos2D.x = newX;
  this.pos2D.y = newY;
  eleCoords.push({x: newX, y: newY});
  //console.log(this.id + " has been set to (" + this.pos2D.x + "," + this.pos2D.y + ")");
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
  return this.pos3D.x != null && this.pos3D.y != null && this.pos3D.z != null;//looks correct
}
Atom.prototype.hover2D = function(){
  return dist(mouseX, mouseY, this.pos2D.x + width / 2, this.pos2D.y + height / 2) < res * 20;
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
  //for (var i = 0;i<this.bonds.length;i++){
    //if (!this.bonds[i].displayed){
    //  console.log("same id");
    //  this.bonds[i].display();
    //}
  //}
  pop();
}
Atom.prototype.display3D = function(){

}
function getNumBondedTo(a){
  var num = 0;
  for (var i = 0;i<bonds.length;i++){
    if (a.getId() === bonds[i].getA1().getId() || a.getId() === bonds[i].getA2().getId()){
      num++;
    }
  }
  return num;
}
function getBondedTo(a){
  var at = [];
  for (var i = 0;i<bonds.length;i++){
    if (a.getId() === bonds[i].getA1().getId()){
      at.push(bonds[i].getA2());
    }else if (a.getId() === bonds[i].getA2().getId()){
      at.push(bonds[i].getA1());
    }
  }
  return at;
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
var atoms = [], bonds = [];
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
  eleString = "HHeLiBeBCBOFNeNaMgAlSiPSClArKCa";
  moleculeMass = 0;
  master_arr = [];
  //symbol, mass, color, name, protons, electron config, ox states, radius in bond [single, double, ...]
  elementData.push(["H",1.00794,color(255,0,0),"Hydrogen",1,[1],[-1,1],[31]]);
  elementData.push(["He",4.00260,color(200,136,0),"Helium",2,[2],[0],[28]]);
  elementData.push(["Li",6.941,,"Lithium",3,[2,1],[1],[128,124]]);
  elementData.push(["Be",9.01218,,"Beryllium",4,[2,2],[2],[96,90,85]]);
  elementData.push(["B",10.81,,"Boron",5,[2,3],[3],[84,78,73]]);
  elementData.push(["C",12.011,color(0,0,0),"Carbon",6,[2,4],[-4,2,4],[76,67,60]]);
  elementData.push(["N",14.0067,color(0,0,255),"Nitrogen",7,[2,5],[-3,-2,-1,1,2,3,4,5],[71,60,54]]);
  elementData.push(["O",15.9994,color(255,255,255),"Oxygen",8,[2,6],[-2],[66,57,53]]);
  elementData.push(["F",18.9984,color(30,200,30),"Fluorine",9,[2,7],[-1],[57]]);
  elementData[9] = ["Ne",20.180,,"Neon",10,[2,8],[0],[58]];
  elementData[10] = ["Na",22.98977,,"Sodium",11,[2,8,1],[1],[166]];
  elementData[11] = ["Mg",24.305,,"Magnesium",12,[2,8,2],[2],[141]];
  elementData[12] = ["Al",26.98154,,"Aluminum",13,[2,8,3],[3],[121]];
  elementData[13] = ["Si",28.0855,,"Silicon",14,[2,8,4],[-4,2,4],[111]];
  elementData[14] = ["P",30.97376,color(200,20,0),"Phosphorus",15,[2,8,5],[-3,3,5],[107,102,94]];
  elementData[15] = ["S",32.065,color(200,200,0),"Sulfur",16,[2,8,6],[-2,4,6],[105,94,95]];
  elementData[16] = ["Cl",35.453,color(67,182,219),"Chlorine",17,[2,8,7],[-1,1,5,7],[102]];
  elementData[17] = ["Ar",39.948,,"Argon",18,[2,8,8],[106]];
  elementData[18] = ["K",39.0983,,"Potassium",19,[2,8,8,1],[203]];
  elementData[19] = ["Ca",40.08,,"Calcium",[2,8,8,2],[176]];
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

  //document.getElementById("t-full").innerHTML += finstr;
  //document.getElementById("mass-p").innerHTML = "Gram-formula mass: " + moleculeMass;
  testH = new Atom("H");
  testH2 = new Atom("H");
  testH.bond(testH2,1);
  //console.log("testH bonded to testH2: " + testH2.isBondedTo(testH));
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
function getBondAngles3D(a){
  var angs = [];
  //var
  return angs;
}
function startConversion3D(){
  bonds3D = [];
  if (atoms.length > 0){
    if (!atoms[0].hasSetPos3D()){
      atoms[0].setPos3D(0, 0, 0);
      nodes.push([0, 0, 0]);
    }
    convertTo3D(atoms[0]);
  }
}
function convertTo3D(curAtom){
    console.log("\nbeginning of conversion for atom " + curAtom.getId());
    var bds = getBondedTo(curAtom);
    var X = bds.length;
    var E = (8 - curAtom.getValence())/2;

    var angs = [];
    if (X == 2){
      if (E == 0){
        angs.push([180, 0]);
        angs.push([0, 0]);
      } else if (E == 1){
        angs.push([150, 0]);
        angs.push([3, 0]);
      } else if (E == 2){
        angs.push([30, 180]);
        angs.push([150, 180]);
      }
    } else if (X == 3){
      if (E == 0){
        angs.push([0, 0])
        angs.push([120, 0]);
        angs.push([240, 0]);
      }else if (E == 1){
        angs.push([0, 30])
        angs.push([120, 30]);
        angs.push([240, 30]);
      }else if (E == 2){
        angs.push([0, 0]);
        angs.push([90, 0]);
        angs.push([180, 0]);
      }
    } else if (X == 4){
      if (E == 0){
        angs.push([0,109.5]);
        angs.push([109.5,0]);
        angs.push([240,109.5]);
        angs.push([120,0]);
      }else if (E == 1){

      }else if (E == 2){

      }else if (E == 1){

      }else if (E == 2){

      }
    } else if (X == 5){

    } else if (X == 6){

    }
    console.log("X: " + X + "\nE:" + E);
    console.log("angs.length : " + angs.length);
    var bdsLeft = [];
    for (var i = 0;i<bds.length;i++){
      var angg = angs[i];
      console.log("angg.length = " + angg.length);
      console.log("inside loop i = " + i);
      console.log("bds[i].hasSetPos3D() : " + bds[i].hasSetPos3D());
      console.log(bds[i].getId());
      if (!bds[i].hasSetPos3D()){
        if (angg.length > 0){
          bds[i].setPos3D(
            40 * sin(angg[0]) * cos(angg[1]),
            40 * sin(angg[1]) * sin(angg[1]),
            40 * cos(angg[0])
          );

          nodes.push(
            [
              40 * sin(angg[0]) * cos(angg[1]),
              40 * sin(angg[1]) * sin(angg[1]),
              40 * cos(angg[0])
            ]
          );
          console.log("added node");
        }

        bdsLeft.push(bds[i]);
        console.log("reached inside of loop");
      }

    }
    console.log("bdsLeft.length after bds loop: " + bdsLeft.length);
    for (var i = 0;i<bdsLeft.length;i++){
      convertTo3D(bdsLeft[i]);
    }
}
function Bond3D(or, an1, an2, r){
  this.origin = or;
  this.ang1 = an1;
  this.ang2 = an2;
  this.radius = r;
}
function toast(status, msg){
  var toaster = document.getElementById("toaster");
  var newToast = document.createElement("div");
  var ih = "<button class=\"btn btn-clear float-right\"></button>"+msg;
  newToast.innerHTML = ih;
  newToast.classList.add("toast");
  newToast.classList.add("toast-"+status);
  //newToast.classList.add("float-right");
  newToast.classList.add("animated");
  newToast.classList.add("0.5s");

  newToast.classList.add("zoomInUp");
  setTimeout(function(){
    newToast.classList.remove("animated");
    newToast.classList.remove("0.5s");
    newToast.classList.remove("zoomInUp");
    newToast.classList.add("animated");
    newToast.classList.add("2s");
    newToast.classList.add("fadeOut");
    //newToast.style.display = "none";
  },duration);
  if (toaster.childNodes.length < 3){
    toaster.insertBefore(newToast,toaster.childNodes[0]);
    setTimeout(function(){
      toaster.removeChild(newToast);
    },duration+1500);
  }
}
function updateTable(n){
  var mass = n.getMass();
  var table = document.getElementById("t-actual");
  var cur = parseFloat(document.getElementById("mass-p").innerText);
  console.log(cur);
  cur += mass;
  document.getElementById("mass-p").innerText = cur;
  //display_arr.push([])
}
function resetField(f){
  var a = document.getElementById(f);
  //
}
function addAtom(){
  var numBonds = parseInt(document.getElementById("num-b").value);
  var a = document.getElementById("selector").value;
  if (a !== "Choose an atom"){
    var n = new Atom(a);
    if (selected){
      //console.log("selected.canBond: " + numBonds + " " + selected.canBond(numBonds));
      //console.log("n.canBond: " + n.canBond(numBonds));
    }
    if (atoms.length == 0){
      atoms.push(n);

      atoms[0].setPos2D(0,0);

    }else {
      if (selected && selected.canBond(numBonds) && n.canBond(numBonds)){
        //var aang = document.getElementById("aang").value;
        var aang = Math.round((atan2(height/2+selected.pos2D.y-mouseY,width/2+selected.pos2D.x-mouseX)+180)/grit)*grit;
        console.log("bonding angle: " + aang);
        var s = n.data[7][numBonds-1] + selected.data[7][numBonds-1];
        console.log("old x: " + selected.pos2D.x +" new x: " + (selected.pos2D.x+cos(aang)*s));
        console.log("old y: " + selected.pos2D.y + " new y: "+(selected.pos2D.y+sin(aang)*s));
        n.setPos2D(selected.pos2D.x+cos(aang)*100,selected.pos2D.y+sin(aang)*100);
        for (var i = 0;i<atoms.length;i++){
          if (dist(atoms[i].pos2D.x,atoms[i].pos2D.y,n.pos2D.x,n.pos2D.y) < 41){
            toast("error", "Atoms cannot overlap");
            return;
          }
        }
        //resetField(document.getElementById("aang"));
        n.bond(selected,numBonds);
        console.log("num bonds: " + numBonds);

        atoms.push(n);
        selected = false;
      }else{
        toast("error","Selected atom cannot bond");
        console.log("selected atom cannot bond");
        return;
      }
    }
    updateComp();
    //updateTable(n);
  }
}
var rotateZ3D = function(theta) {
    var sin_t = sin(theta);
    var cos_t = cos(theta);

    for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var x = node[0];
        var y = node[1];
        node[0] = x * cos_t - y * sin_t;
        node[1] = y * cos_t + x * sin_t;
    }
};
var rotateY3D = function(theta) {
    var sin_t = sin(theta);
    var cos_t = cos(theta);

    for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var x = node[0];
        var z = node[2];
        node[0] = x * cos_t - z * sin_t;
        node[2] = z * cos_t + x * sin_t;
    }
};
var rotateX3D = function(theta) {
    var sin_t = sin(theta);
    var cos_t = cos(theta);

    for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var y = node[1];
        var z = node[2];
        node[1] = y * cos_t - z * sin_t;
        node[2] = z * cos_t + y * sin_t;
    }
};
var D3 = false;
function draw(){
  molName = document.getElementById("name").value;
  D3 = document.getElementById("view-type").checked;

  background(255,255,255);
  fill(255);
  stroke(0);
  rect(0,0,width-2,height-2);
  push();
  translate(width/2, height/2);
  //var t = Math.min(millis()/2000,atoms.length);
  if (D3){
    console.log("Num nodes: " + nodes.length);
    fill(255, 0, 0);
    for (var i = 0;i<nodes.length;i++){
      ellipse(nodes[i][0], nodes[i][1], 20*res, 20*res);
    }
  }else{
    for (var i = 0;i<atoms.length;i++){
  		/*if (atoms[i].hasSetPos2D() && atoms[i].hover){
        if (atoms[i].hover2D() && mouseIsPressed){
          if (!selected.includes(atoms[i])){
            selected.push(atoms[i]);
            mouseIsPressed = false;
            console.log(atoms[i].getId() + " selected");
          }
        }*/
        atoms[i].display2D();

        console.log(atoms[i].pos2D.x + "," + atoms[i].pos2D.y);
        console.log(atoms[i].pos3D.x + "," + atoms[i].pos3D.y + "," + atoms[i].pos3D.z);
        console.log(atoms[i].hasSetPos3D());
    }

    noFill();
    stroke(100,100,100,100);
    strokeWeight(4);
    for (var i = 0;i<bonds.length;i++){
      bonds[i].display();
    }
    if (selected){
      ellipse(selected.pos2D.x,selected.pos2D.y,40*res,40*res);
      if (selected.canBond(1)){
        var bds = parseInt(document.getElementById("num-b").value);
        var aaang = Math.round((atan2(height/2+selected.pos2D.y-mouseY,width/2+selected.pos2D.x-mouseX)+180)/grit)*grit;
        //var ang = atan2(this.a2.getPos2D().y - this.a1.getPos2D().y, this.a2.getPos2D().x - this.a1.getPos2D().x);

        fill(100,100,100,100);
        push();
        translate(selected.pos2D.x, selected.pos2D.y);
        rotate(aaang-90);
        for (var i = 0;i<bds;i++){
          //display lines for tentative bonds
          //line(selected.pos2D.x+cos(aaang)*20+i*10, selected.pos2D.y+sin(aaang)*20+i*10, selected.pos2D.x+cos(aaang)*80+i*10, selected.pos2D.y+sin(aaang)*80+i*10);
          line(-bds/2*5+10*i,20,-bds/2*5+10*i,80*res);
        }
        pop();
        noStroke();
        if (dist(mouseX,mouseY,width/2+selected.pos2D.x+cos(aaang)*100, height/2+selected.pos2D.y+sin(aaang)*100) <= 20){
          fill(75,75,75,100);
        }
        ellipse(selected.pos2D.x+cos(aaang)*100, selected.pos2D.y+sin(aaang)*100, 40*res,40*res);
      }

    }
  }
  pop();

  fill(0,0,0);
  textSize(25);
  if (document.getElementById("t-display").checked){
    text(molName,width/2,85);
  }
  startConversion3D();
  noLoop();
}
function mouseDragged(){
  rotateY3D(mouseX - pmouseX);
  rotateX3D(mouseY - pmouseY);
  loop();
}
function mouseMoved(){
  loop();
}
function mouseClicked(){
  if (!D3){
    if (selected && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
      var aaang = Math.round((atan2(height/2+selected.pos2D.y-mouseY,width/2+selected.pos2D.x-mouseX)+180)/grit)*grit;
      if (dist(mouseX, mouseY, width/2+selected.pos2D.x+cos(aaang)*100, height/2+selected.pos2D.y+sin(aaang)*100) <= 20*res){
        addAtom();
      }

    }
    for (var i = 0;i<atoms.length;i++){
      if (atoms[i].hover2D()){
        if (atoms[i] !== selected){
          selected = atoms[i];
        }else{
          selected = false;
        }
      }
    }
  }
}
