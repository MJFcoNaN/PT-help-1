// ==UserScript==
// @name         NEU6 IP2Loc
// @namespace    neu6ip2loc
// @author       harleybai
// @description  Show Peer's Loc According To IPv6
// @grant        none
// @include      http://bt.neu6.edu.cn/*
// @require      http://bt.neu6.edu.cn/static/js/mobile/jquery-1.8.3.min.js
// @icon         http://bt.neu6.edu.cn/favicon.ico
// @version      20190101
// ==/UserScript==


// 脚本预处理阶段
const jq = jQuery.noConflict();

(function() {
	if (location.href.match(/uid=\d+\&do=profile/)) {
		jq('ul#pbbs>li').each(function() {
			let li = jq(this);
			if (/注册.*IP/.test(li.find('em').text())) {
				let ipv6 = li.text().replace(/.*IP|\s*-\s*/ig, '');
				jq.getJSON('http://pytool.sinaapp.com/geo?type=json&encoding=utf-8&ip=' + ipv6, function(data) {
					li.append('<br>' + data.geo.loc);
				});
			} else if (/问.*IP/.test(li.find('em').text())) {
				let ipv6 = li.text().replace(/.*IP|:\d+\s*-\s*/ig, '');
				jq.getJSON('http://pytool.sinaapp.com/geo?type=json&encoding=utf-8&ip=' + ipv6, function(data) {
					li.append(data.geo.loc);
				});
			}
		});
	}
	if (location.href.match(/thread-|tid=/) && jq('p.cp_pls.cl').length) {
		jq('p.cp_pls.cl').each(function() {
			let c1 = jq(this);
			if (c1.find("a:contains('IP')").length) {
				let req_href = c1.find("a:contains('IP')").attr('href');
				jq.get(req_href, function(data) {
					try {
						let ip_match = data.getElementsByTagName('root')[0].innerHTML.match(/ip=(.*?)&amp/);
						if (ip_match) {
							jq.getJSON('http://pytool.sinaapp.com/geo?type=json&encoding=utf-8&ip=' + ip_match[1], function(data) {
								c1.append('<br>' + data.geo.loc.replace(/\s+/, ' - '));
							});
						}
					} catch (error) {
						console.log(error);
					}
				});
			}
		});
	}
})();