var curr_blindness_type;

$(document).ready(function() {
	$("header").load("partials/header.html");
	changeBlindnessType($("#blindness-type-select").val());
});

$(document).on("change", "#blindness-type-select", function() {
	changeBlindnessType($(this).val(), $("#blindness-type-number").val());
});

$(document).on("change", "#blindness-type-number", function() {
	changeBlindnessType($("#blindness-type-select").val(), $(this).val());
});

function uncapitalizeFirstLetter(word) {
	return word.slice(0,1).toLowerCase();
}


function capitalizeWord(word) {
	return word.slice(0,1).toUpperCase() + word.slice(1);
}

function capitalizeSentence(sentence) {
	var temp_word_arr = sentence.split(" ");
	for (i in temp_word_arr) {
		temp_word_arr[i] = capitalizeWord(temp_word_arr[i]);
	}
	return temp_word_arr.join(" ");
}

function changeBlindnessType(type) {
	if (type.length > 0) {
		curr_blindness_type = type;
		$("#blindness-type-header-text").text(capitalizeSentence(curr_blindness_type));
	}

	setBoxesColors( uncapitalizeFirstLetter( curr_blindness_type) );
}

function getRandomPointOnLine(type) {
	var line_arr = getLineEquations( type );
	var rand = Math.floor( Math.random() * line_arr.length );

	var line_info = line_arr[rand];
	var rand_x =  Math.random();

	var rand_y = (line_info.m * rand_x) + line_info.b;
	var rand_z = 1 - rand_x - rand_y;

	return { 'x': rand_x, 'y': rand_y, 'z': rand_z };
}

function convertRGBtoXYZ(r, g, b) {
	r = r / 255;
	g = g / 255;
	b = b / 255;

	var x = r * 0.41 + g * 0.36 + b * 0.18;
	var y = r * 0.21 + g * 0.72 + b * 0.072;
	var z = r * 0.029 + g * 0.12 + b * 0.95;

	return {'x':x, 'y':y, 'z':z};
}


function convertXYZtoRGB(x, y, z) {
	var r = (3.24 * x) + (-1.54 * y) + (-0.499 * z);
	var g = (-0.97 * x) + (1.88 * y) + (0.042 * z);
	var b = (0.056 * x) - (0.20 * y) + (1.06 * z);

	r = r * 255;
	g = g * 255;
	b = b * 255;

	return { 'r':r, 'g':g, 'b':b };
}

function setBoxesColors( type , num_boxes ) {
	if (type == undefined) {
		curr_blindness_type = $("#blindness-type-select").val() ;
		type = uncapitalizeFirstLetter( curr_blindness_type );
	}

	if (num_boxes == undefined) {
		num_boxes = $("#blindness-type-number").val();
	}

	$("#boxes").empty();

	for (var i = 0; i < num_boxes; i++) {
		$("#boxes").append('<div id = "box-'+num_boxes+'" class = "box border-box"></div>');
		setBoxColor( $(".box").last(), type );
		$(".box").last().append("<div class = 'box-label'>"+$(".box").last().css('background-color')+"</div>");
	}

}

function setBoxColor( box, type ) {
	if ( type == 'r' ) {
		var temp_rgb = {'r': Math.random() * 255, 'g': Math.random() * 255, 'b': Math.random() * 255};
	} else {
		var temp_xyz = getRandomPointOnLine( type );
		var temp_rgb = convertXYZtoRGB( temp_xyz.x, temp_xyz.y, temp_xyz.z );
	}

	var r = Math.floor(temp_rgb.r);
	var g = Math.floor(temp_rgb.g);
	var b = Math.floor(temp_rgb.b);

	var rgb = "rgb("+r+", "+g+", "+b+")";

	$(box).css('background-color', rgb);
}

function getLineEquation(type, number) {
	return getLineEquations(type)[number];
}


function getLineEquations(type) {
	//var x1 = 1/3;
	//var y1 = 1/3;

	var line_arr = [];

	if (type == 'p') {
		return [{'m':0.36, 'b':0.23},
		{'m':0.23, 'b':0.06},
		{'m':0.08, 'b':0.18},
		{'m':-0.06, 'b':0.28},
		{'m':-0.19, 'b':0.38},
		{'m':-0.32, 'b':0.48},
		{'m':-0.45, 'b':0.58},
		{'m':-0.58, 'b':0.68},
		{'m':-0.71, 'b':0.78},
		{'m':-0.87, 'b':0.9}];
	} else if (type == 'd') {
		return [{'m':-0.4, 'b':0.112},
		{'m':-0.46, 'b':0.21},
		{'m':-0.54, 'b':0.31},
		{'m':-0.63, 'b':0.42},
		{'m':-0.71, 'b':0.53},
		{'m':-0.79, 'b':0.63},
		{'m':-0.87, 'b':0.74},
		{'m':-0.96, 'b':0.85},
		{'m':-1.04, 'b':0.97}];	
	} else {
		return [{'m':-2.83, 'b':0.50},
		{'m':-5.01, 'b':0.88},
		{'m':-8.37, 'b':1.46},
		{'m':-444.44, 'b':77.69},
		{'m':14.94, 'b':-2.61},
		{'m':6.99, 'b':-1.22},
		{'m':3.12, 'b':-0.55},
		{'m':2.20, 'b':-0.38},
		{'m':1.43, 'b':-0.25},
		{'m':1.06, 'b':-0.19},
		{'m':0.83, 'b':-0.15},
		{'m':2.20, 'b':-0.38},
		{'m':0.48, 'b':-0.084}];
	}

	/*var m = (x1 == x2) ? 0 : (y2 - y1) / (x2 - x1);
	var b = y2 - (m * x2);

	return {'m':m, 'b':b};*/
}

