//var surl = "espiot.hcitsolutions.in";
//var surl="localhost";
//var surl= "13.127.146.22";
//var port= 6789;
var surl= storage("surl");
var port= storage("port");
var isAndroid=0;

var a = {};
var auth_token = "";
var selected_bulb = null;
var i;
var times = [0, 0, 0, 0];
var schedule_saving = 0;
var refresh_time = 2;
var user = {
	name: "Harendra Chauhan"
};
var is_online = 0;
var online_timeout = null;
var wt = 0;
var socket = null;
var is_tab_active = true;
var btn_status = {
	LED_1: 0,
	LED_2: 0,
	LED_3: 0,
	LED_4: 0,
	LED_5: 0,
	LED_6: 0,
	LED_7: 0,
	LED_8: 0,
	power: 0
};
var device_status = 0;
led_numbers = {
	1: "LED_1",
	2: "LED_2",
	3: "LED_3",
	4: "LED_4",
	5: "LED_5",
	6: "LED_6",
	7: "LED_7",
	8: "LED_8",
};
led_values = {
	LED_1: 1,
	LED_2: 2,
	LED_3: 3,
	LED_4: 4,
	LED_5: 5,
	LED_6: 6,
	LED_7: 7,
	LED_8: 8,
};
led_names = {
	LED_1: "TV LIGHT",
	LED_2: "FAN",
	LED_3: "OUTSIDE BULB",
	LED_4: "CONCEALED LIGHT 1",
	LED_5: "CONCEALED LIGHT 2",
	LED_6: "INSIDE BULB",
	LED_7: "CONCEALED LIGHT 3",
	LED_8: "CONCEALED LIGHT 4",
};
schedule_names = {
	LED_1: "SCHEDULE_1",
	LED_2: "SCHEDULE_2",
	LED_3: "SCHEDULE_3",
	LED_4: "SCHEDULE_4",
	LED_5: "SCHEDULE_5",
	LED_6: "SCHEDULE_6",
	LED_7: "SCHEDULE_7",
	LED_8: "SCHEDULE_8",
};
var long_press_time = null;
var schedulling = 0;
var status_icon = {
	OFFLINE: "offline.svg",
	ONLINE: "online.svg",
	S_ERROR: "tethring-off.svg",
	SOCKET_ON: "tethring-on.svg",
	WARNING: "warning.svg",
	D_ONLINE: "check-circle.svg",
};

function change_temprature_type() {
	var type = $("#tempratureUnitSpan").text();
	var val = parseInt($("#tmpSpan").text());
	if (isNaN(val)) {
		type = (type == "C") ? "F" : "C";
		$("#tempratureUnitSpan").text(type);
	} else if (type == "C") {
		val = (val * 9 / 5) + 32;
		type = (type == "C") ? "F" : "C";
		$("#tempratureUnitSpan").text(type);
		$("#tmpSpan").text(val);
	} else {
		val = (val - 32) * 5 / 9;
		type = (type == "C") ? "F" : "C";
		$("#tempratureUnitSpan").text(type);
		$("#tmpSpan").text(val);
	}
}

function update_status() {
	var url;
	if (!navigator.onLine) {
		url = status_icon.OFFLINE;
	} else {
		url = status_icon.ONLINE;
		if (is_online) {
			url = status_icon.SOCKET_ON;
			if (!device_status) {
				url = status_icon.WARNING;
			}
		}
	}
	document.getElementById("statusImg").src = url;
}
setInterval(update_status, 500);

function admin_add_user() {
	if (!is_online || null === socket) {
		toast("Failed To Connect");
		return;
	}
	var name = $("#userAddName").val();
	var uname = $("#userAddUName").val();
	var pass = $("#userAddPass").val();
	var status = parseInt($("#userAddstatus").val());
	if (uname === "") {
		$("#userAddUName").focus();
		toast("Invalid Username");
	} else if (name === "") {
		$("#userAddName").focus();
		toast("Invalid Name");
	} else if (pass === "") {
		$("#userAddPass").focus();
		toast("Invalid Password");
	} else {
		$("#AddUserBtn").attr("disabled", true);
		var m = '{"admin": true, "action" : "Add_User", "name" : "' + name + '", "uname" : "' + uname + '", "password" : "' + pass + '", "status" : "' + status + '"}';
		send(m);
	}
}

function admin_update_user() {
	if (!is_online || null === socket) {
		toast("Failed To Connect");
		return;
	}
	var name = $("#userUpdateName").val();
	var uname = $("#userUpdateUName").val();
	var pass = $("#userUpdatePass").val();
	var tele = $("#userUpdateTelegram").val();
	var status = parseInt($("#userUpdatestatus").val());
	if (name === "") {
		toast("Invalid Name");
	} else if (uname === "") {
		toast("Invalid Username");
	} else if (pass === "") {
		toast("Invalid Password");
	} else {
		$("#UpdateUserBtn").attr("disabled", true);
		var m = '{"admin": true, "action" : "Update_User", "name" : "' + name + '", "uname" : "' + uname + '", "password" : "' + pass + '", "status" : "' + status + '", "telegram" : "' + tele + '"}';
		send(m);
	}
}

function admin_remove_user() {
	if (!is_online || null === socket) {
		toast("Failed To Connect");
		return;
	}
	var uname = $("#userUpdateUName").val();
	if (uname === "") {
		return;
	}
	$("#UpdateUserBtnDel").attr("disabled", true);
	var m = '{"admin" : true, "action" : "Remove_User", "uname" : "' + uname + '"}';
	send(m);

}

function user_update_feed(a) {
	$("#userUpdateName").val(a.getAttribute('data-name'));
	$("#userUpdateUName").val(a.getAttribute('data-uname'));
	$("#userUpdatePass").val(a.getAttribute('data-password'));
	$("#userUpdateStatus").val(a.getAttribute('data-status'));
	$("#userUpdateDate").val(a.getAttribute('data-date'));
	$("#userUpdateTelegram").val(a.getAttribute('data-telegram'));
}

function long_press(e) {
	clearTimeout(long_press_time);
	long_press_time = null;
	if (!is_online || null == socket) {
		return;
	}
	var l = $(e.target).closest("label");
	var i = l.find("input");
	var n = i.attr("name");

	if (n == "power") {
		return;
	}
	schedulling = led_values[n];

	var m = '{"resource":"' + schedule_names[n] + '","interval":0,"enabled":true}';
	send(m);
	$(".time_selector").val("");
	$("#schedule_head_txt").text(led_names[n]);

	schedule_saving = 0;
	$("#sch_save_btn").attr("disabled", false);

	$("#tab_2").slideUp(400, function () {
		$(this).hide();
		$("#tab_3").show(400, function () {
			$("#tab_3").slideDown();
		});
	});
}

function change_admin_mode() {
	if ($("#admin_mode").is(":visible")) {
		$("#admin_mode").hide();
		$("#user_mode").show();
	} else {
		$("#user_mode").hide();
		$("#admin_mode").show();
	}
}

function logout() {
	storage("auth_token", "");
	storage("user", "");
	auth_token = "";
	close_socket();
	$("#tab_2").slideDown(400, function () {
		$(this).hide();
		$("#tab_1").show(400, function () {
			$(this).slideDown();
		});
	});
}

function cancel_schedule() {
	schedulling = 0;
	schedule_saving = 0;
	$("#tab_3").slideDown(400, function () {
		$(this).hide();
		$("#tab_2").show(400, function () {
			$(this).slideDown();
		});
	});
}

function save_schedule() {
	if (schedulling) {
		$(".time_selector").each(function (index) {
			t = $(this).val().split(":");
			times[index] = parseInt(t[0] * 60) + parseInt(t[1]);
			if (isNaN(times[index])) {
				times[index] = 0;
			}
		});

		var a = times[0];
		var b = times[1];
		var c = times[2];
		var d = times[3];

		if (a == 0 && b == 0 && c != 0 && d != 0) {
			a = c;
			b = d;
			c = 0;
			d = 0;
		} else if ((a != 0 || b != 0) && (c != 0 || d != 0)) {
			if ((a > b && a > c && b < c) || (a < b && a < c && b > c) || (a > b && a > d && b < d) || (a < b && a < d && b > d)) {
				toast("Schedule Times are Invalid");
				return;
			}
		}

		//n=(schedulling-1)*4+17
		var m = '{"resource":"SCHEDULE_' + schedulling + '","in":{"1": ' + a + ', "2": ' + b + ', "3": ' + c + ', "4": ' + d + "}}";
		schedule_saving = 1;
		send(m);
		$("#sch_save_btn").attr("disabled", true);
	}
}

function user_login(e) {
	var u = $("#username").val();
	var p = $("#password").val();
	if (u == "" || u.length < 1) {
		$("#username").focus();
		toast("Enter a username");
		return;
	}
	if (p == "" || p.length < 1) {
		$("#password").focus();
		toast("Enter a password");
		return;
	}

	// e.disabled=true;e.innerHTML="Wait";
	auth_token = u + "/" + p;
	storage("auth_token", auth_token);
	close_socket();
	create_socket();
	// $("#tab_1").slideUp(400,function(){
	//     $(this).hide();
	//     $('#tab_2').show(400,function(){
	//         $('#tab_2').slideDown(function(){
	//             create_socket();
	//         });
	//     })
	// });
}
var toast_timeout = null;
//Android.deviceInfo();
function toast(txt, color) {
    if (!color) {
        color = "#808080";
	}
	if(isAndroid){
        Android.showToast(txt,color);return;
    }
	if (null != toast_timeout) {
		clearTimeout(toast_timeout);
		toast_timeout = null;
	}
	var x = document.getElementById("snackbar");
	x.innerHTML = txt;
	x.className = "show";
	if (!color) {
		color = "#333";
	}
	x.style.backgroundColor = color;
	toast_timeout = setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 3000);
}

function storage(key, value) {
	if (typeof Storage !== "undefined") {
		if (typeof value !== "undefined") {
			if (value === "") {
				return localStorage.removeItem(key);
			}
			return localStorage.setItem(key, value);
		}
		return localStorage.getItem(key);
	}
	return null;
}

function getColor(value) {
	value /= 100;
	var hue = (value * 120).toString(10);
	return ["hsl(", hue, ",100%,50%)"].join("");
}
// var water_fill_loop=0;
function fill_water(limit, loop) {
	// if(typeof loop === "undefined"){
	//     water_fill_loop=0;
	//     setTimeout(function(){ water_fill_loop=1 }, 190);
	// }
	// else if(water_fill_loop==0){
	//     return;
	// }
	// if(limit==wt){ water_fill_loop=0;return;}

	// wt=(limit>wt) ? wt+parseInt((limit-wt)/10)+1 : wt-(parseInt((wt-limit)/10)+1);

	wt = limit;
	$("#water_per").text(wt);
	$(".water_level").css("width", wt + "%");
	c = getColor(wt);
	$(".water_level").css("background-color", c);

	// setTimeout(function(){ fill_water(limit,1); }, 200);
}

function create_socket() {
	// return; // Uncomment it for debug without socket
	// console.log("CALLED");
	if(surl==null){
	    return;
	}
	if (socket != null) {
		return;
	}
	if (auth_token == null || auth_token == "") {
		return;
	}
	if (!navigator.onLine) {
		//if(online_timeout){clearTimeout(online_timeout);online_timeout=null;}online_timeout=setTimeout(function(){ create_socket(); }, 3000);
		return;
	}
	if (!is_tab_active) {
		return;
	}
	//return;

	if (online_timeout) {
		clearTimeout(online_timeout);
		online_timeout = null;
	}
	socket = new WebSocket("ws://" + surl + ":"+String(port)+"/" + auth_token);
	socket.onopen = function (e) {
		console.log("[open] Connection established, send -> server");
	};
	socket.onmessage = function (event) {
		is_online = 1;
		var msg = JSON.parse(event.data);
		// console.log(event.data);
		if (!("error" in msg) && !("admin" in msg)) {
			device_status = 1;
		}
		if ("error" in msg && msg.error) {
			device_status = 0;
			fill_water(0);
			toast(msg.msg, "red");
			if (schedule_saving) {
				schedulling = 0;
				schedule_saving = 0;
				$("#sch_save_btn").attr("disabled", false);
				$("#tab_3").slideDown(400, function () {
					$(this).hide();
					$("#tab_2").show(400, function () {
						$(this).slideDown();
					});
				});
			}
			reverse_btn();
			return;
		}

		if ("admin" in msg && msg.admin) {
			if ("users" in msg) {
				var temp_u = "";
				if (msg.users) {
					i = 0;
					$.each(msg.users, function (index, value) {
						i++;
						var s = value.STATUS ? "<span style='color:green'>ON</span>" : "<span style='color:red'>OFF</span>";
						temp_u += "<tr data-toggle='modal' data-target='#userUpdateModl' onclick='user_update_feed(this)' class='user_list' data-telegram='" + value.telegram + "' data-name='" + value.Name + "' data-uname='" + value.username + "' data-password='" + value.password + "' data-date='" + value.Add_Date + "' data-s='" + value.STATUS + "'><th scope='row'>" + (i) + "</th><td>" + value.Name + "</td><td>" + value.username + "</td><td>" + s + "</td></tr>";
					})
				}
				$("#users_list").html(temp_u);
			} else if ("new_user_login" in msg) {
				var temp_us = msg.new_user_login;
				var $row = $('tr[data-online_users_uname="' + temp_us.username + '"]');
				if ($row.length) {
					i = parseInt($row.find(':nth-child(3)').text()) + 1;
					$row.find(':nth-child(3)').text(i);
				} else {
					var temp_u_online = '<tr data-online_users_uname="' + temp_us.username + '"><td>' + temp_us.Name + '</td><td>' + temp_us.username + '</td><td>1</td></tr>';
					$("#online_users_list").append(temp_u_online);
				}
			} else if ("remove_user_login" in msg) {
				var temp_us = msg.remove_user_login;
				var $row = $('tr[data-online_users_uname="' + temp_us.username + '"]');
				if ($row.length) {
					i = parseInt($row.find(':nth-child(3)').text()) - 1;
					if (i === 0) {
						$row.remove();
					} else {
						$row.find(':nth-child(3)').text(i);
					}
				}
			} else if ("msg" in msg && msg.msg == "user_add") {
				$("#AddUserBtn").attr("disabled", false);
				if (msg.res == "SUCCESS") {
					$("#UserAddName").val('');
					$("#UserAddUName").val('');
					$("#UserAddPass").val('');
					$('#AddUserBtnClose').click();
					toast("Successfully Added User");
				} else {
					toast("Couldn't Add User");
				}
			} else if ("msg" in msg && msg.msg == "user_update") {
				$("#UpdateUserBtn").attr("disabled", false);
				if (msg.res == "SUCCESS") {
					$("#UserUpdateName").val('');
					$("#UserUpdateUName").val('');
					$("#UserUpdatePass").val('');
					$('#UpdateUserBtnClose').click();
					toast("Successfully Updated User");
				} else {
					toast("Couldn't Update User");
				}
			} else if ("msg" in msg && msg.msg == "user_remove") {
				$("#UpdateUserBtnDel").attr("disabled", false);
				if (msg.res == "SUCCESS") {
					$("#UserUpdateName").val('');
					$("#UserUpdateUName").val('');
					$("#UserUpdatePass").val('');
					$('#UpdateUserBtnClose').click();
					toast("Successfully Delete User");
				} else {
					toast("Couldn't Delete User");
				}
			}
		} else if ("error" in msg && !msg.error) {
			toast(msg.msg, "green");
			return;
		} else if ("user" in msg && !msg.user) {
			close_socket();
			storage("auth_token", "");
			storage("user", "");
			auth_token = null;
			toast(msg.msg);

			if ($("#tab_2").is(":visible")) {
				$("#tab_2").slideDown(400, function () {
					$(this).hide();
					$("#tab_1").show(400, function () {
						$(this).slideDown();
					});
				});
			} else if ($("#tab_3").is(":visible")) {
				$("#tab_3").slideDown(400, function () {
					$(this).hide();
					$("#tab_1").show(400, function () {
						$(this).slideDown();
					});
				});
			}
			return;
		} else if ("user" in msg && msg.user && "details" in msg) {
			storage("user", msg.details);
			if (msg.details.type == "SUPER_ADMIN") {
				$("#admin_mode_viewer").show();
				$("#online_users_list").html("");
				$("#users_list").html("");
			} else {
				$("#admin_mode_viewer").hide();
			}
			$("#user_name").text(msg.details.name);
			var test_visible = $("#tab_1").is(":visible");
			if (test_visible) {
				$("#tab_1").slideUp(400, function () {
					$(this).hide();
					$("#tab_2").show(400, function () {
						$("#tab_2").slideDown();
					});
				});
			}
			return;
		} else if (msg.resource.startsWith("SCHEDULE")) {
			if (schedule_saving) {
				$("#tab_3").slideDown(400, function () {
					$(this).hide();
					$("#tab_2").show(400, function () {
						$(this).slideDown();
					});
				});
				toast("Schedule saved successfully");
				schedule_saving = 0;
				$("#sch_save_btn").attr("disabled", false);
			}
			i = 0;
			$.each(msg.value, function (index, value) {
				i++;
				a[i] = value;
				if (value != 0) {
					var h = ("0" + parseInt(value / 60).toString()).slice(-2);
					var m = ("0" + parseInt(value % 60).toString()).slice(-2);
					var t = h + ":" + m;
					$("#time_" + i).val(t);
				}
			});
			if (!a[1] && a[2]) {
				$("#time_1").val("00:00");
			}
			if (a[1] && !a[2]) {
				$("#time_2").val("00:00");
			}
			if (!a[3] && a[4]) {
				$("#time_3").val("00:00");
			}
			if (a[3] && !a[4]) {
				$("#time_4").val("00:00");
			}
		} else if (msg.resource == "water") {
			fill_water(msg.value);
		} else if (msg.resource == "TEMPRATURE") {
			var valSpan = $("#tmpSpan");
			var typSpan = $("#tempratureUnitSpan").text();
			if (typSpan == "C") {
				valSpan.text(msg.value);
			} else {
				valSpan.text((msg.value * 9 / 5) + 32);
			}
		} else {
			btn_status[msg.resource] = msg.value;
			$("input:checkbox[name=" + msg.resource + "]").prop("checked", msg.value);
			img = $("input:checkbox[name=" + msg.resource + "]").next(".icon-box");
			if (msg.value) {
				sr = img.data("on");
				if (img.data("spin") == "1") {
					img.find("img").addClass("fa-spin");
				} else {
					img.css("background-image", "url(" + sr + ")");
				}
			} else {
				sr = img.data("off");
				if (img.data("spin") == "1") {
					img.find("img").removeClass("fa-spin");
				} else {
					img.css("background-image", "url(" + sr + ")");
				}
			}
		}
	};
	socket.onclose = function (event) {
		$("tmpSpan").val("");
		is_online = 0;
		socket = null;
		device_status = 0;
		if (event.wasClean) {
			console.log("[close] Connection closed cleanly, code=" + event.code + " reason=" + event.reason);
		} else {
			console.log("[close] Connection died");
		}
		if (online_timeout) {
			clearTimeout(online_timeout);
			online_timeout = null;
		}
		online_timeout = setTimeout(function () {
			create_socket();
		}, 3000);
	};
	socket.onerror = function (error) {
		socket = null;
		is_online = 0;
		//setTimeout(function(){ create_socket(); }, 10000);
//		console.log("[error] " + error.message);
	};
}

function send(msg) {
	if (socket == null || socket.readyState !== WebSocket.OPEN) {
		return;
	}
	socket.send(msg);
	// console.log(msg);
}

function reverse_btn() {
	$.each(btn_status, function (index, value) {
		$("input:checkbox[name=" + index + "]").prop("checked", value);
		img = $("input:checkbox[name=" + index + "]").next(".icon-box");
		if (value) {
			sr = img.data("on");
			if (img.data("spin") == "1") {
				img.find("img").addClass("fa-spin");
			} else {
				img.css("background-image", "url(" + sr + ")");
			}
		} else {
			sr = img.data("off");
			if (img.data("spin") == "1") {
				img.find("img").removeClass("fa-spin");
			} else {
				img.css("background-image", "url(" + sr + ")");
			}
		}
	});
}

function isFunction(functionToCheck) {
	return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
}
window.onbeforeunload = function () {
	close_socket();
};

function close_socket() {
	$("#tmpSpan").text("");
	if (socket != null && isFunction(socket.close)) {
		socket.onclose = function () {}; // disable onclose handler first
		socket.onerror = function () {}; // disable onerror handler first
		socket.close();
		socket = null;
		is_online = 0;
		device_status = 0;
	}
}
function refresh_page(){
    storage("last_sync","");
    location.reload(true);
}
$().ready(function () {
    if(storage("last_sync")==null || (parseInt(storage("last_sync"))+10*60 < Math.floor(Date.now() / 1000)) || surl==null){   // Check if Last Sync is not Under 10 Minutes
        $.get("https://gist.githubusercontent.com/hc54321/17e6dda32e05c13260da04d34afd73fe/raw/ohb.config.json?_"+Math.random()+"="+Date.now(), function( data ) {
          var o=JSON.parse(data);
          storage("surl",o.link);
          storage("port",o.port);
          storage("last_sync",Math.floor(Date.now() / 1000));
          location.reload(false);
        });
    }


	//storage('auth_token',"OK");
	//storage('user','{"name":"Harendra Chauhan"}');
	if (storage("auth_token") == null) {
		$("#tab_1").show();
		$("#username").focus();
	} else {
		$("#tab_2").show();
		auth_token = storage("auth_token");
		create_socket();
	}

	$("body").contextmenu(function (e) {
		e.preventDefault();
	});
	$("label").mouseleave(function () {
		if (long_press_time) {
			clearTimeout(long_press_time);
			long_press_time = null;
		}
	});
	$("input:checkbox").on("click", function (e) {
		if (long_press_time) {
			clearTimeout(long_press_time);
			long_press_time = null;
		}
		if (!is_online || socket == null || socket.readyState !== WebSocket.OPEN) {
			e.preventDefault();
			return;
		}
	});
	$("body").on("mousedown touchstart", 'label[data-t="btn"]', function (e) {
		if (long_press_time) {
			clearTimeout(long_press_time);
			long_press_time = null;
		}
		long_press_time = setTimeout(function () {
			long_press(e);
		}, 750);
	});

	$("input:checkbox").on("change", function (e) {
		if (!is_online || socket == null) {
			return;
		}

		var n = $(this).attr("name");
		var v = $(this).is(":checked");
		var m = '{"resource":"' + n + '","in":' + v + "}";
		send(m);
	});

	$(".time_selector").on("keyup change", function (e) {
		const reTime = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
		const time = $(this).val();
		if (reTime.exec(time)) {
			const minute = Number(time.substring(3, 5));
			const hour = (Number(time.substring(0, 2)) % 12) + minute / 60;
			var t = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18.5' fill='none' stroke='%23222' stroke-width='3' /><path d='M20,4 20,8 M4,20 8,20 M36,20 32,20 M20,36 20,32' stroke='%23bbb' stroke-width='1' /><circle cx='20' cy='20' r='2' fill='%23222' stroke='%23222' stroke-width='2' /></svg>"), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M18.5,24.5 19.5,4 20.5,4 21.5,24.5 Z' fill='%23222' style='transform:rotate(${
                            (360 * minute) / 60
                        }deg); transform-origin: 50% 50%;' /></svg>"), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M18.5,24.5 19.5,8.5 20.5,8.5 21.5,24.5 Z' style='transform:rotate(${
                            (360 * hour) / 12
                        }deg); transform-origin: 50% 50%;' /></svg>")`;
			$(this).css("backgroundImage", t);
		}
	});

if(isAndroid){  // On App
    document.addEventListener("visibilitychange", handleVisibilityChange, false);
    function handleVisibilityChange() {
        if (!document.hidden) {
            is_tab_active = true;
            create_socket();
        }
        else{
            is_tab_active = false;
            close_socket();
        }
    }
}
else{   // On Web
	$(window).blur(function () {
		is_tab_active = false;
		close_socket();
	});
	$(window).focus(function () {
		is_tab_active = true;
		create_socket();
	});
//	function onOnline(){
//        toast("You are now back online.", "green");
//        if (is_tab_active) {
//            create_socket();
//        }
//    }
//    function onOffline(){
//        toast("You lost connection.", "red");
//        close_socket();
//    }
//    document.addEventListener("online", onOnline, false);
//    document.addEventListener("offline", onOffline, false);
}
	// change_admin_mode();
	//fill_water(parseInt(Math.random()*100));
});
    window.addEventListener("offline", function (event) {
    	toast("You lost connection.", "red");
    	close_socket();
    });
    window.addEventListener("online", function (event) {
    	toast("You are now back online.", "green");
    	if (is_tab_active) {
    		create_socket();
    	}
    });