// ==UserScript==
// @name        DouBan Info Export
// @namespace   harleybai.info
// @version     20190111
// @description Export Movie Info
// @author      harleybai
// @grant       unsafeWindow
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @include     https://movie.douban.com/subject*
// @require     http://cdn.bootcss.com/simplemodal/1.4.4/jquery.simplemodal.min.js
// @updateURL   https://github.com/harleybai/PT-help/raw/master/docs/js/Douban%20-%20Info%20Export.user.js
// ==/UserScript==

(function () {
    var imdb_already_show = false;
    var imdb_info_already_ok = false;
    var awards_info_already_ok = false;
    var douban_info_already_ok = false;
    var poster, foreign_title, trans_title, this_title, year, region, genre, language, playdate, douban_rating, douban_link, episodes, duration, director, writer, cast, tags, awards, story_line, introduction = '';
    var imdb_link, imdb_rating;
    var descr = '';

    function addIMDBRate(imdb_average_rating, imdb_votes) {
        if (imdb_already_show) {
            return;
        }
        if (imdb_average_rating == '') {
            $("div#interest_sectl").append('<div class="rating_wrap clearbox" rel="v:rating"><div class="clearfix"><div class="rating_logo ll">IMDB评分</div></div><div class="rating_self clearfix" typeof="v:Rating"><strong class="ll rating_num" property="v:average"></strong><span property="v:best" content="10.0"></span><div class="rating_right not_showed"><div class="ll bigstar bigstar00"></div><div class="rating_sum">暂无评分</div></div></div>');
            imdb_already_show = true;
            return;
        }
        let starLevel = [9.6, '50', 8.6, '45', 7.6, '40', 6.6, '35', 5.6, '30', 4.6, '25', 3.6, '20', 2.6, '15', 1.6, '10', 0.5, '05', 0, '00'];
        let star = 'bigstar';
        for (let i = 0; i < starLevel.length; i = i + 2) {
            if (parseFloat(imdb_average_rating) >= starLevel[i]) {
                star += starLevel[i + 1];
                break;
            }
        }
        $("div#interest_sectl").append(`<div class="rating_wrap clearbox" rel="v:rating"><div class="clearfix"><div class="rating_logo ll">IMDB评分</div></div><div class="rating_self clearfix" typeof="v:Rating"><strong class="ll rating_num" property="v:average">${imdb_average_rating}</strong><span property="v:best" content="10.0"></span><div class="rating_right "><div class="ll bigstar ${star}"></div><div class="rating_sum"><a href="${imdb_link}" class="rating_people"><span property="v:votes">${imdb_votes}</span>人评价</a></div></div></div>`);
        imdb_already_show = true;
    }

    function getImdbInfo(isGenInfo) {
        if (imdb_link && !imdb_info_already_ok) {
            GM_xmlhttpRequest({
                method: 'GET',
                url: imdb_link,
                timeout: 5000,
                onreadystatechange: function (res) {
                    if (res.readyState != 4) {
                        query_info('查询影片的IMDb信息失败');
                        return;
                    }
                    if (/404 Error - IMDb/.test(res.responseText)) {
                        return;
                    }
                    let page = $(res.responseText
                        .replace(/<script(\s|>)[\S\s]+?<\/script>/g, '')
                        .replace(/\s+src=/ig, ' data-src=')
                    );
                    let imdb_average_rating = (parseFloat(page.find('span[itemprop="ratingValue"]').text()).toFixed(1) + '').replace('NaN', '');
                    let imdb_votes = page.find('span[itemprop="ratingCount"]').text().trim();
                    story_line = page.find('#titleStoryLine div.inline.canwrap>p>span:first').text().trim();
                    imdb_rating = imdb_votes ? imdb_average_rating + '/10 from ' + imdb_votes + ' users' : '';
                    imdb_info_already_ok = true;
                    if (isGenInfo) {
                        descriptionGenerator();
                    } else {
                        addIMDBRate(imdb_average_rating, imdb_votes);
                    }
                },
                ontimeout: function () {
                    query_info('查询影片的IMDb信息失败');
                },
            });
        } else {
            imdb_info_already_ok = true;
        }
    }

    function descriptionGenerator() {
        let show_poster = $('input#poster').prop('checked');
        let show_awards = $('input#awards').prop('checked');
        descr = '';
        if (show_poster) {
            descr += poster ? `[img]${poster}[/img]\n\n` : "";
        }
        descr += foreign_title ? ("[b]" + foreign_title + "[/b]\n\n") : "";
        descr += trans_title ? ('◎译　　名　' + trans_title + "\n") : "";
        descr += this_title ? ('◎片　　名　' + this_title + "\n") : "";
        descr += year ? ('◎年　　代　' + year + "\n") : "";
        descr += region ? ('◎产　　地　' + region + "\n") : "";
        descr += genre ? ('◎类　　别　' + genre + "\n") : "";
        descr += language ? ('◎语　　言　' + language + "\n") : "";
        descr += playdate ? ('◎上映日期　' + playdate + "\n") : "";
        descr += imdb_rating ? ('◎IMDb评分  ' + imdb_rating + "\n") : "";
        descr += imdb_link ? ('◎IMDb链接  ' + imdb_link + "\n") : "";
        descr += douban_rating ? ('◎豆瓣评分　' + douban_rating + "\n") : "";
        descr += douban_link ? ('◎豆瓣链接　' + douban_link + "\n") : "";
        descr += episodes ? ('◎集　　数　' + episodes + "\n") : "";
        descr += duration ? ('◎片　　长　' + duration + "\n") : "";
        descr += director ? ('◎导　　演　' + director + "\n") : "";
        descr += writer ? ('◎编　　剧　' + writer + "\n") : "";
        descr += cast ? ('◎主　　演　' + cast.replace(/\n/g, '\n' + '　'.repeat(4) + '  　').trim() + "\n") : "";
        descr += tags ? ('\n◎标　　签　' + tags + "\n") : "";
        t_introduction = story_line ? (introduction + '\n\n' + story_line) : introduction;
        descr += t_introduction ? ('\n◎简　　介\n\n　　' + t_introduction.replace(/\n/g, '\n' + '　'.repeat(2)) + "\n") : "";
        if (show_awards) {
            descr += awards ? ('\n◎获奖情况\n\n　　' + awards.replace(/\n/g, '\n' + '　'.repeat(2)) + "\n") : "";
        }
        $('textarea#out_text').val(descr);
        GM_setClipboard(descr);
        query_info('已复制到剪切板');
    };

    function query_info(info) {
        let _info = '[';
        _info += imdb_info_already_ok ? '<span style="color:green">IMDB</span>' : '<span style="color:red">IMDB</span>';
        _info += awards_info_already_ok ? ', <span style="color:green">奖项</span>' : ', <span style="color:red">奖项</span>';
        _info += douban_info_already_ok ? ', <span style="color:green">豆瓣</span>]' : ', <span style="color:red">豆瓣</span>]';
        $('div#out_info').html(`<span style="color:red">>&nbsp;${info}</span>&nbsp;&nbsp;${_info}`);
    };

    //获取&显示IMDb评分
    let imdb_link_anchor = $('#info span.pl:contains("IMDb链接")');
    if (imdb_link_anchor[0]) {
        imdb_link = imdb_link_anchor.next().attr('href').replace(/(\/)?$/, '/');
    }
    getImdbInfo(false);

    // 生成信息
    $("div.rating_wrap.clearbox").before('<div><a id="output"><b>Export Info</b></a></div><br>');
    $("a#output").click(function () {
        $.modal('<div id="out_window"><div id="out_title"><b>DouBan Info Export</b><span id="poster_awards"><label><input id="poster" type="checkbox">海报</label>&nbsp;&nbsp;<label><input id="awards" type="checkbox" checked>奖项</label></span><b style="float:right" class="simplemodal-close">Close</b></div><div id="out_info"></div><div><textarea id="out_text" cols="60" rows="30" class="quick"></textarea></div></div>', {
            autoPosition: true,
            escClose: true,
            overlayClose: true
        });
        $("#out_window").css({
            "top": "50%",
            "left": "50%"
        });
        $("#out_title").css({
            "background": "#DCDCDC",
            "font-size": "14px",
            "padding": "5px 15px",
            "position": "float"
        });
        $("#poster_awards").css({
            "font-size": "13px",
            "padding": "5px 15px",
            "position": "float"
        });
        $("#out_info").css({
            "background": "#F5F5DC",
            "padding-left": "15px",
        });
        $("#out_text").click(function () {
            $(this).select();
        });
        $("input#poster").click(function () {
            descriptionGenerator();
        });
        $("input#awards").click(function () {
            descriptionGenerator();
        });
        if (imdb_info_already_ok && douban_info_already_ok && awards_info_already_ok) {
            descriptionGenerator();
            return;
        }
        let fetch = function (anchor) {
            return anchor[0].nextSibling.nodeValue.trim();
        };
        query_info('> ');
        //获取本页的豆瓣信息
        let chinese_title = document.title.replace('(豆瓣)', '').trim();
        foreign_title = $('#content h1>span[property="v:itemreviewed"]').text().replace(chinese_title, '').trim();
        let aka_anchor = $('#info span.pl:contains("又名")');
        let aka;
        if (aka_anchor[0]) {
            aka = fetch(aka_anchor).split(' / ').sort(function (a, b) { //首字(母)排序
                return a.localeCompare(b);
            }).join('/');
        }
        if (foreign_title) {
            trans_title = chinese_title + (aka ? ('/' + aka) : '');
            this_title = foreign_title;
        } else {
            trans_title = aka ? aka : '';
            this_title = chinese_title;
        }
        //年代
        year = $('#content>h1>span.year').text().slice(1, -1);
        //产地
        let regions_anchor = $('#info span.pl:contains("制片国家/地区")');
        if (regions_anchor[0]) {
            region = fetch(regions_anchor).split(' / ').join('/');
        }
        //类别
        genre = $('#info span[property="v:genre"]').map(function () {
            return $(this).text().trim();
        }).toArray().join('/');
        //语言
        let language_anchor = $('#info span.pl:contains("语言")');
        if (language_anchor[0]) {
            language = fetch(language_anchor).split(' / ').join('/');
        }
        //上映日期
        playdate = $('#info span[property="v:initialReleaseDate"]').map(function () {
            return $(this).text().trim();
        }).toArray().sort(function (a, b) { //按上映日期升序排列
            return new Date(a) - new Date(b);
        }).join('/');
        //IMDB链接
        let imdb_link_anchor = $('#info span.pl:contains("IMDb链接")');
        if (imdb_link_anchor[0]) {
            imdb_link = imdb_link_anchor.next().attr('href').replace(/(\/)?$/, '/');
        }
        //豆瓣链接
        douban_link = `https://${window.location.href.match(/movie.douban.com\/subject\/\d+/)}/`;
        //集数
        let episodes_anchor = $('#info span.pl:contains("集数")');
        if (episodes_anchor[0]) {
            episodes = fetch(episodes_anchor);
        }
        //片长
        let duration_anchor = $('#info span.pl:contains("单集片长")');
        if (duration_anchor[0]) {
            duration = fetch(duration_anchor);
        } else {
            duration = $('#info span[property="v:runtime"]').text().trim();
        }
        // IMDb信息（最慢，最先请求）
        getImdbInfo(true);
        // 该影片的评奖信息
        if (!awards_info_already_ok) {
            $.ajax({
                method: 'get',
                url: douban_link + 'awards',
                success: function (data) {
                    awards = $(data
                            .replace(/<script(\s|>)[\S\s]+?<\/script>/g, '')
                            .replace(/\s+src=/ig, ' data-src=')
                        ).find('#content>div>div.article').html()
                        .replace(/[ \n]/g, '')
                        .replace(/<\/li><li>/g, '</li> <li>')
                        .replace(/<\/a><span/g, '</a> <span')
                        .replace(/<(div|ul)[^>]*>/g, '\n')
                        .replace(/<[^>]+>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/ +\n/g, '\n')
                        .trim();
                    awards_info_already_ok = true;
                    descriptionGenerator();
                },
                error: function () {
                    query_info('查询影片的获奖情况失败');
                }
            });
        }
        if (!douban_info_already_ok) {
            $.ajax({
                type: 'get',
                url: 'https://api.douban.com/v2/movie/' + douban_link.match(/\/subject\/(\d+)/)[1],
                dataType: 'jsonp',
                jsonpCallback: 'callback',
                success: function (json) {
                    let douban_average_rating = json.rating.average;
                    let douban_votes = json.rating.numRaters.toLocaleString();
                    let introduction_t = json.summary.replace(/^None$/g, '暂无相关剧情介绍');

                    douban_rating = douban_average_rating + '/10 from ' + douban_votes + ' users';
                    introduction = introduction ? (introduction_t + introduction) : introduction_t;
                    poster = json.image.replace(/s(_ratio_poster|pic)/g, 'l$1');
                    director = json.attrs.director ? json.attrs.director.join(' / ') : '';
                    writer = json.attrs.writer ? json.attrs.writer.join(' / ') : '';
                    cast = json.attrs.cast ? json.attrs.cast.join('\n') : '';
                    tags = json.tags.map(function (member) {
                        return member.name;
                    }).join(' | ');
                    douban_info_already_ok = true;
                    descriptionGenerator();
                },
                error: function () {
                    query_info('查询影片的豆瓣信息失败');
                }
            });
        }
    });
})();