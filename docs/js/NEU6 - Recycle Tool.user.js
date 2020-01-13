// ==UserScript==
// @name         NEU6 Recycle Tool
// @namespace    neu6recycletool
// @author       xingxing
// @description  回收选择小工具
// @grant        none
// @include      http://bt.neu6.edu.cn/forum.php?mod=modcp*
// @require      http://bt.neu6.edu.cn/static/js/mobile/jquery-1.8.3.min.js
// @updateURL    https://github.com/harleybai/PT-help/raw/master/docs/js/NEU6%20-%20Recycle%20Tool.user.js
// @downloadURL  https://github.com/harleybai/PT-help/raw/master/docs/js/NEU6%20-%20Recycle%20Tool.user.js
// @icon         http://bt.neu6.edu.cn/favicon.ico
// @version      20190301
// @modifier     MJFcoNaN, 20200113, add anime
// ==/UserScript==

// https://cdn.bootcss.com/jquery/1.8.3/jquery.min.js
// http://bt.neu6.edu.cn/static/js/mobile/jquery-1.8.3.min.js

const secondTimeout = 500;
const moveToReason = "[合集已出,单集回收 or 断种回收]感谢分享";

// 脚本预处理阶段
const jq = jQuery.noConflict();

(function () {

	if (/https*:\/\/bt\.neu6\.edu\.cn\/forum\.php[\S]mod=modcp/.test(location.href) && (jq('table').length > 1)) {
		jq('h2.pbm.ptm').before('<h2 class="pbm ptm"><div class="z"><span>正则表达式辅助填写：|&nbsp;&nbsp;&nbsp;</span><span>Season：</span><select class="regexfield ps">' +
			'<option value="" selected>---</option>' +
			'<option value="S01">S01</option>' +
			'<option value="S02">S02</option>' +
			'<option value="S03">S03</option>' +
			'<option value="S04">S04</option>' +
			'<option value="S05">S05</option>' +
			'<option value="S06">S06</option>' +
			'<option value="S07">S07</option>' +
			'<option value="S08">S08</option>' +
			'</select>&nbsp;&nbsp;&nbsp;&nbsp;<span>Standard：</span><select class="regexfield ps">' +
			'<option value="" selected>---</option>' +
			'<option value="720p">720p</option>' +
			'<option value="1080p">1080p</option>' +
			'<option value="1080i">1080i</option>' +
			'<option value="2160p">2160p</option>' +
			'<option value="4k">4k</option>' +
			'</select>&nbsp;&nbsp;&nbsp;&nbsp;<span>Medium：</span><select class="regexfield ps">' +
			'<option value="" selected>---</option>' +
			'<option value="Blu-ray">Blu-ray</option>' +
			'<option value="BluRay">BluRay</option>' +
			'<option value="WEB-DL">WEB-DL</option>' +
			'<option value="HDTV">HDTV</option>' +
			'<option value="HDTVrip">HDTVrip</option>' +
			'<option value="WEB">WEB</option>' +
			'<option value="WEB-HR">WEB-HR</option>' +
			'<option value="WEBRip">WEBRip</option>' +
			'</select>&nbsp;&nbsp;&nbsp;&nbsp;<span>Title：</span><input type="text" style="width:10em;" id="reg_title" class="px">&nbsp;&nbsp;&nbsp;&nbsp;<span>Index：</span><input type="text" style="width:10em;" id="select_index" class="px"><input type="button" id="select_by_index" style="size:80px;" value=" OK ">' +
			'</div></h2><br/><h2 class="pbm ptm"><div class="z"><span>输入正则表达式或时间：<input type="text" style="width:15em;" id="title_reg" class="px" placeholder="RegExp" onkeypress="if(event.keyCode==13){select_btn.click();}"><input type="button" id="select_btn" style="size:100px;" value=" 提交 ">&nbsp;|&nbsp;<input type="button" id="seletc_all_btn" style="size:100px;" value=" 全选 ">&nbsp;|&nbsp;<input type="button" id="seletc_other_btn" style="size:100px;" value=" 反选 ">&nbsp;|&nbsp;<input type="button" id="no_seed_btn" style="size:100px;" value="选择断种">&nbsp;|&nbsp;<input type="button" id="seletc_none_btn" style="size:100px;" value="取消选择">&nbsp;|&nbsp;<input type="button" id="move_btn" style="size:100px;" value=" 移动 ">&nbsp;|&nbsp;<input type="button" id="del_btn" style="size:100px;" value=" 删除 ">&nbsp;|&nbsp;<input type="button" id="type_btn" style="size:100px;" value=" 分类 "></span></div></h2><br/>');
	}

	// 全选
	jq('#seletc_all_btn').click(function () {
		if (jq('table').length > 1) {
			jq('#threadlist td>input.pc').each(function () {
				if (!jq(this).prop("checked")) {
					jq(this).prop("checked", true);
					tmodclick(this);
				}
			});
		}
	});
	// 取消全选
	jq('#seletc_none_btn').click(function () {
		if (jq('table').length > 1) {
			jq('#threadlist td>input.pc').each(function () {
				if (jq(this).prop("checked")) {
					jq(this).prop("checked", false);
					tmodclick(this);
				}
			});
		}
	});
	// 反选
	jq('#seletc_other_btn').click(function () {
		if (jq('table').length > 1) {
			jq('#threadlist td>input.pc').each(function () {
				if (jq(this).prop("checked")) {
					jq(this).prop("checked", false);
				} else {
					jq(this).prop("checked", true);
				}
				tmodclick(this);
			});
		}
	});
	// 选择断种
	jq('#no_seed_btn').click(function () {
		jq('#seletc_none_btn').click();
		if (jq('table').length > 1) {
			jq('table:last tbody:gt(0)').each(function () {
				let seed_tbody = jq(this);
				let seed_url = seed_tbody.find('tr th a').attr("href");
				jq.get(seed_url, function (resp) {
					let page = jq(resp); // 构造 jQuery 对象，用于后期处理
					if (page.find('div.pct>div>div.mtw.mbw>img').length) {
						let singal_url = page.find('div.pct>div>div.mtw.mbw>img').attr("src");
						if (/signal_0\.png/.test(singal_url)) {
							seed_tbody.find('input.pc').click();
						}
					}
				});
			});
		}
	});
	// 通过索引选择
	jq('#select_by_index').click(function () {
		let index = -1;
		let index_str = jq('input#select_index').val();
		if (index_str) {
			if (jq('table').length > 1) {
				jq('table:last tbody:gt(0)').each(function () {
					let seed_tbody = jq(this);
					let seed_title = seed_tbody.find('tr th a').text();
					if (seed_title.indexOf(index_str) >= 0) {
						index = jq('table:last tbody:gt(0)').index(this);
						jq('input#select_index').val(index);
						return false;
					}
				});
			}
		}
		if (index >= 0) {
			jq('table:last tbody:gt(' + index + ') td>input.pc').each(function () {
				if (!jq(this).prop("checked")) {
					jq(this).prop("checked", true);
					tmodclick(this);
				}
			});
		}
	});
	// 正则匹配选择
	jq('#select_btn').click(function () {
		let title_reg_str = jq('input#title_reg').val();
		let title_reg = new RegExp(title_reg_str, "i");
		if (jq('table').length > 1) {
			jq('table:last tbody:gt(0)').each(function () {
				let seed_tbody = jq(this);
				let seed_title = seed_tbody.find('tr th a').text();
				if (title_reg.test(seed_title)) {
					seed_tbody.find('tr td:eq(1) input.pc').each(function () {
						jq(this).prop("checked", true);
						tmodclick(this);
					});

				}
			});
		}
	});
	jq('#reg_title').change(function () {
		let title = jq('#reg_title').val().trim();
		let reg_str = '';
		reg_str += title.match(/\[(S\d+)\]/i) ? title.match(/\[(S\d+)\]/i)[1] : '';
		reg_str += title.match(/\[(\d+[pk])/i) ? ('.*' + title.match(/\[(\d+[pk])/i)[1]) : '';
		reg_str += title.match(/\/([\w-]+)\//i) ? ('.*' + title.match(/\/([\w-]+)\//i)[1]) : '';
		jq('input#title_reg').val(reg_str);
	});
	jq('#move_btn').click(function () {
		tmodthreads(2, 'move');
		setTimeout(function () {
			let moveto = 0;
			let current = jq("h2.pbm.ptm a:first").attr("href").match(/fid=(\d+)/)[1];
			if (current == 48 || current == 77) {
				moveto = 58;
			} else if (current == 14 || current == 73) {
				moveto = 62;
                        } else if (current == 44 || current == 52) {//动漫主版  精品区
                                moveto = 69;
			}
			if (moveto) {
				jq("#moderateform select#moveto").val(moveto);
				jq("#moderateform textarea#reason").text(moveToReason);
			}
		}, secondTimeout);
	});
	jq('#del_btn').click(function () {
		tmodthreads(3, 'delete');
	});
	jq('#type_btn').click(function () {
		tmodthreads(2, 'type');
	});

	jq(document).ready(function () {
		//双击清空
		jq('input#select_index').dblclick(function () {
			jq('input#select_index').val("");
		});
		// select选择处理
		jq(".regexfield").change(function () {
			let str = jq(this).val();
			let reg_str = jq('input#title_reg').val();
			if (reg_str) {
				if (str.match(/S\d\d/i) && reg_str.match(/S\d\d/i)) {
					jq('input#title_reg').val(reg_str.replace(/S\d\d/i, str));
				} else if (str.match(/\d+[pik]/i) && reg_str.match(/\d+[pik]/i)) {
					jq('input#title_reg').val(reg_str.replace(/\d+[pik]/i, str));
				} else if (str.match(/Blu-?ray|WEB-DL|HDTV|WEBRip/i) && reg_str.match(/Blu-?ray|WEB-DL|HDTV|WEBRip/i)) {
					jq('input#title_reg').val(reg_str.replace(/Blu-?ray|WEB-DL|HDTV|WEBRip/i, str));
				} else {
					jq('input#title_reg').val(reg_str + ".*" + str);
				}
			} else {
				jq('input#title_reg').val(str);
			}
			jq(this).val("");
		});

	});

})();
