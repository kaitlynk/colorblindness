var injected = injected || (function() {
	var methods = {};

	methods.setColorblindBox = function() {
		$("body").prepend("<div id = 'colorblind-header'>\
			<select id = 'colorblind-select-options'>\
				<option value = ''>--Select Colorblind Type--</option>\
				<option value = 'p'>Protanope</option>\
				<option value = 'd'>Deuteranope</option>\
				<option value = 't'>Tritanope</option>\
				</select></div>");
		$("#colorblind-header").css('background-color', '#000')
			.css('color','#FFF')
			.css('position', 'fixed')
			.css('top', '0px')
			.css('right','0px')
			.css('text-align', 'right')
			.css('display', 'inline-block')
			.css('z-index', '1000000000000000000000000000000000000')
			.css('padding','5px');
	};

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		var data = {};

		if (methods.hasOwnProperty(request.method))
			data = methods[request.method]();

		sendResponse({ data: data });

		return true;
	});

	return true;
})();

$(document).on('change', '#colorblind-select-options', function() {
	setColorblind();
	$("#colorblind-header").remove();
});

function setColorblind() {
	var type = $("#colorblind-select-options").val();

	var colors = {};
	var all_others = [];
	var nodes = document.querySelectorAll('*');
	var node, bgColor, fontColor;

	for (i  = 0; i < nodes.length; i++) {
		node = nodes[i];
		
		bgColor = window.getComputedStyle(node)['background-color'];
		fontColor = window.getComputedStyle(node)['color'];

		map = mapColor( bgColor, type,'bg', colors, all_others, node );
		colors = map[0];
		all_others = map[1];
		
		map = mapColor( fontColor, type, 'font', colors, all_others, node );
		colors = map[0];
		all_others = map[1];
	}

	var hasNaN = false;

	for (var i in colors) {
		if (isNaN(i.slice(1, i.length))) {
			hasNaN = true;
		}
	}

	if (hasNaN || Object.keys(colors).length == 0) {
		return;
	} else {
		replaceColors( colors , type );
		replaceAllOthers ( all_others, type );

		var size = 0;

		for ( var i in colors ) {
			for ( var j in colors[i] ) {
				size += colors[i][j].length;
			}
		}

		alert("A total of " + size + " colors were replaced due to colorblindness! Can you detect them all?");
	}
}


function removeSpaces(color) {
	return color.replace(/ /g, '');
}


function replaceColors(colors, type) {
	for ( var i in colors ) {
		var replacement_line = getReplacementLine( type );
		var curr_line = getLineEquations( type );
		
		var replacement_point = getLineIntersection( replacement_line, curr_line[ i.slice(1, curr_line.length) ] );
		var replacement_rgb = convertXYZtoRGB( replacement_point.x, replacement_point.y, replacement_point.z );

		var r = Math.floor(replacement_rgb.r);
		var g = Math.floor(replacement_rgb.g);
		var b = Math.floor(replacement_rgb.b);

		var rgb = "rgb("+r+", "+g+", "+b+")";

		for (j in colors[i]) {
			if (j == "bg")
				$(colors[i][j]).css('background-color', rgb);
			else 
				$(colors[i][j]).css('color', rgb);
		}
	}
}


function mapColor(color, type, color_type, colors, all_others, node) {
	color = removeSpaces(color);

	if ( color != 'rgb(255,255,255)' && color != 'rgb(0,0,0)' && !(color.indexOf('rgba') === 0 && 
		color.substr(-3) === ',0)')) {

		var rgb_1 = color.split('(')[1];
		var rgb_2 = rgb_1.split(')')[0];
		var rgb = rgb_2.split(',');

		var xyz = convertRGBtoXYZ(rgb[0], rgb[1], rgb[2]);

		var inLine = isInLine(type, xyz.x, xyz.y);
		if ( inLine >= 0 ) {
			if (color == 'rgb(0,255,0)') {
				console.log(node);
			}
			var temp_type = type + inLine;
			if ( colors[temp_type] == undefined ) {
				colors[temp_type] = {};
				colors[temp_type][color_type] = [node];
			} else {
				if ( colors[temp_type][color_type] != undefined ) {
					colors[temp_type][color_type].push(node);
				} else {
					colors[temp_type][color_type] = [node];
				}
			}
		} else {
			

			if (rgb[0] == rgb[1] && rgb[0] == rgb[2]) {
			} else {
				all_others.push({'node': node, 'color_type': color_type});
			}				
		}
	}

	return [colors, all_others];
}


function replaceAllOthers( all_others, type ) {
	for (i in all_others) {
		var color_type = all_others[i].color_type;
		if (color_type == 'bg') {
			var color = removeSpaces($(all_others[i].node).css('background-color'));
		} else {
			var color = removeSpaces($(all_others[i].node).css('color'));
		}

		var rgb_1 = color.split('(')[1];
		var rgb_2 = rgb_1.split(')')[0];
		var rgb = rgb_2.split(',');
		var new_rgb = removeSelectedColor(rgb[0], rgb[1], rgb[2], type);

		if (new_rgb != 'rgb(0, 0, 0)') {
			if (color_type == 'bg') {
				$(all_others[i].node).css('background-color', new_rgb);
			} else {
				$(all_others[i].node).css('color', new_rgb);
			}
		}
	}
}


function removeSelectedColor(r, g, b, type) {
	var rand = Math.random();
	if (type == 'p') {
		r = (rand > .5) ? 0 : 204;
		g = (rand > .5) ? 0 : 204;
	} else if (type == 'd') {
		r = (rand > .5) ? 0 : 204;
		g = (rand > .5) ? 0 : 204;
	} else {
		b = (rand > .5) ? 0 : 229;
		g = (rand > .5) ? 0 : 204;
	}

	return 'rgb('+r+', '+g+', '+b+')';
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


function isInLine(type, x, y) {
	var line_arr = getLineEquations(type);
	var thresh = .02;
	if (type == 'p')
		thresh = .03;
	else if (type == 't')
		thres = .02;

	for (var i = 0; i < line_arr.length; i++) {
		if ( Math.abs( y - (line_arr[i].m * x + line_arr[i].b) ) < 0.01 ) {
			return i;
		}
	}

	return -1;
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
		{'m':-0.46, 'b':0.207},
		{'m':-0.54, 'b':0.312},
		{'m':-0.63, 'b':0.418},
		{'m':-0.71, 'b':0.527},
		{'m':-0.79, 'b':0.632},
		{'m':-0.87, 'b':0.736},
		{'m':-0.96, 'b':0.847},
		{'m':-1.04, 'b':0.962}];	
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
}


function getRandomPointOnLine(type) {
	var line_arr = getLineEquations(type);
	var rand = Math.floor( Math.random() * line_arr.length );

	var line_info = line_arr[rand];
	var rand_x = Math.random() * .3;
	var rand_y = (line_info.m * rand_x) + line_info.b;
	var rand_z = 1 - rand_x - rand_y;

	return { 'x': rand_x, 'y': rand_y, 'z': rand_z };
}


function getReplacementLine(type) {
	if (type == 'p') {
		var x1 = .475;
		var y1 = .505
		var x2 = .075;
		var y2 = .1;
	} else if (type == 'd') {
		var x1 = .475;
		var y1 = .500;
		var x2 = .075;
		var y2 = .05;
	} else {
		var x1 = .025;
		var y1 = .5;
		var x2 = .75;
		var y2 = .25;
	}

	var m = (x1 == x2) ? 0 : (y2 - y1) / (x2 - x1);
	var b = y2 - (m * x2);

	return {'m':m, 'b':b};
}


function getLineIntersection(line1, line2) {
	var x = (line2.b - line1.b) /  (line1.m - line2.m);
	var y = line1.m * x + line1.b;
	var z = 1 - x - y;
	return {'x':x, 'y':y, 'z':z};
}


