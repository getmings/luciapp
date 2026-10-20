// SPDX-License-Identifier: Apache-2.0
/*

 * Copyright (C) 2022-2026 sirpdboy <herboy2008@gmail.com>
 */
'use strict';
'require view';
'require dom';
'require fs';
'require ui';
'require uci';
'require form';
'require poll';
'require rpc';
'require network';

/* ================================================================== *
 * 界面微调样式（只影响本页，不依赖主题是否提供对应类）
 * ================================================================== */
var TC_STYLE_ID = 'timecontrol-view-style';

var TC_CSS = `
:root{
	--tc-accent:#2f6fed; --tc-ok:#16a34a; --tc-bad:#dc2626; --tc-warn:#d97706;
	--tc-line:rgba(127,127,127,.28); --tc-soft:rgba(127,127,127,.06); --tc-muted:rgba(127,127,127,.95);
}

/* ---------- 卡片：顶部概览 / 设备状态 / 全局设置 / 设备规则 ---------- */
#status_bar, #tc-device-status, #cbi-timecontrol-timecontrol, #cbi-timecontrol-device{
	border:1px solid var(--tc-line); border-radius:14px; padding:18px 22px; margin:0 0 18px;
	background:var(--tc-soft); box-shadow:0 1px 2px rgba(0,0,0,.04);
}
#tc-device-status > h3, #cbi-timecontrol-timecontrol > h3, #cbi-timecontrol-device > h3{
	position:relative; margin:0 0 6px; padding:0 0 0 12px; border:0; font-size:16px; font-weight:600; line-height:1.4;
}
#tc-device-status > h3::before, #cbi-timecontrol-timecontrol > h3::before, #cbi-timecontrol-device > h3::before{
	content:""; position:absolute; left:0; top:3px; bottom:3px; width:4px; border-radius:4px; background:var(--tc-accent);
}
#tc-device-status > .cbi-section-descr, #cbi-timecontrol-timecontrol > .cbi-section-descr, #cbi-timecontrol-device > .cbi-section-descr{
	margin:0 0 14px 12px; padding:0; font-size:13px; line-height:1.75; color:var(--tc-muted);
}

/* ---------- 顶部概览 ---------- */
.tc-hero-head{ display:flex; flex-wrap:wrap; gap:10px 20px; align-items:center; justify-content:space-between; }
.tc-hero-links{ display:flex; flex-wrap:wrap; gap:4px 14px; font-size:12px; color:var(--tc-muted); }
.tc-hero-links a{ text-decoration:none; }
.tc-lead{ margin:12px 0 0; font-size:13.5px; line-height:1.7; color:var(--tc-muted); }

/* ---------- 状态胶囊 ---------- */
.tc-pill{ display:inline-flex; align-items:center; gap:7px; padding:3px 12px 3px 10px; border-radius:999px;
	font-size:13px; font-weight:600; line-height:22px; border:1px solid transparent; white-space:nowrap; }
.tc-pill i{ width:8px; height:8px; border-radius:50%; background:currentColor; display:inline-block; }
.tc-pill-ok{ color:var(--tc-ok); background:rgba(22,163,74,.12); border-color:rgba(22,163,74,.3); }
.tc-pill-bad{ color:var(--tc-bad); background:rgba(220,38,38,.10); border-color:rgba(220,38,38,.28); }
.tc-pill-wait{ color:var(--tc-muted); background:rgba(127,127,127,.12); border-color:var(--tc-line); }
.tc-pill-warn{ color:var(--tc-warn); background:rgba(217,119,6,.12); border-color:rgba(217,119,6,.3); }
.tc-pid{ margin-left:8px; font-size:12px; color:var(--tc-muted); }

/* ---------- 设备状态表 ---------- */
.tc-table{ width:100%; border-collapse:separate; border-spacing:0; }
.tc-table th{ text-align:left; font-size:12px; font-weight:600; color:var(--tc-muted); padding:8px 12px; border-bottom:1px solid var(--tc-line); }
.tc-table td{ padding:10px 12px; border-bottom:1px solid var(--tc-line); vertical-align:middle; line-height:1.6; word-break:break-word; }
.tc-table tr:last-child td{ border-bottom:0; }
.tc-table tbody tr:hover td{ background:rgba(127,127,127,.06); }
.tc-empty{ text-align:center; color:var(--tc-muted); padding:22px 12px !important; }
.tc-mono{ font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12.5px; }

/* ---------- 通用：说明文字、按钮、开关 ---------- */
#cbi-timecontrol-timecontrol .cbi-value-description,
#cbi-timecontrol-device .cbi-value-description,
.modal.cbi-modal .cbi-value-description{ margin-top:6px; font-size:12px; line-height:1.55; color:var(--tc-muted); }
#cbi-timecontrol-timecontrol .cbi-button, #cbi-timecontrol-device .cbi-button, .modal.cbi-modal .cbi-button{ border-radius:8px; }
#cbi-timecontrol-device input[type="checkbox"], .modal.cbi-modal input[type="checkbox"]{
	width:18px; height:18px; accent-color:var(--tc-accent); cursor:pointer; vertical-align:middle;
}

/* ---------- 全局设置：保持主题原有的“左标题右控件”布局，只统一间距 ---------- */
#cbi-timecontrol-timecontrol .cbi-section-node{ margin:0; padding:0; border:0; background:none; }
#cbi-timecontrol-timecontrol .cbi-value{ padding:12px 0; margin:0; border-bottom:1px dashed var(--tc-line); }
#cbi-timecontrol-timecontrol .cbi-value:last-child{ border-bottom:0; }
#cbi-timecontrol-timecontrol .cbi-value-title{ font-weight:600; }
#cbi-timecontrol-timecontrol .cbi-dropdown{ min-width:12rem; max-width:20rem; }

/* ---------- 下拉项：收起只显示简短标题，展开后才显示完整说明 ---------- */
.cbi-dropdown > ul > li .tc-note{ display:none; }
.cbi-dropdown[open] > ul.dropdown > li .tc-note{
	display:block; margin-top:.2em; font-weight:normal; font-size:.92em; line-height:1.4; opacity:.72; white-space:normal;
}
.cbi-dropdown[open] > ul.dropdown > li .tc-brief{ font-weight:600; }

/* ---------- 设备规则表：控件限宽，避免功能区被撑爆 ---------- */
#cbi-timecontrol-device .cbi-section-node{ margin:0; padding:0; border:0; background:none; }
#cbi-timecontrol-device .cbi-section-create{ margin:0 0 12px; padding:0; }
#cbi-timecontrol-device .th{ font-size:12px; font-weight:600; color:var(--tc-muted); white-space:nowrap; }
#cbi-timecontrol-device .td{ padding:10px 6px; line-height:1.55; vertical-align:middle; }
#cbi-timecontrol-device tr.cbi-section-table-row{ transition:background .15s; }
#cbi-timecontrol-device tr.cbi-section-table-row:hover{ background:rgba(127,127,127,.06); }
#cbi-timecontrol-device tr.cbi-section-table-row.tc-row-off .td:not([data-name="enable"]):not(.cbi-section-actions){ opacity:.5; }

#cbi-timecontrol-device .cbi-dropdown:not(.btn):not(.cbi-button),
#cbi-timecontrol-device select.cbi-input-select{ min-width:6rem; max-width:13rem; width:auto; }
#cbi-timecontrol-device .td[data-name="comment"] input[type="text"]{ max-width:9rem; }
#cbi-timecontrol-device .td[data-name="mac"] .cbi-dropdown{ width:12.5rem; }
#cbi-timecontrol-device .td[data-name="time_mode"] .cbi-dropdown{ width:8.5rem; }
#cbi-timecontrol-device .cbi-dropdown[open] > ul.dropdown{ min-width:15rem; }

/* 规则摘要：小标签，自动换行 */
#cbi-timecontrol-device .td[data-name="_rule"]{ line-height:1.45; }
.tc-summary{ display:flex; flex-wrap:wrap; gap:5px; }
.tc-seg{ display:inline-block; padding:0 10px; border-radius:8px; font-size:12.5px; line-height:22px; background:rgba(127,127,127,.12); }
.tc-seg-days{ background:rgba(47,111,237,.14); color:var(--tc-accent); font-weight:600; }
.tc-seg-time{ background:rgba(22,163,74,.13); color:var(--tc-ok); }
.tc-seg-dur{ background:rgba(217,119,6,.14); color:var(--tc-warn); }

/* ---------- 编辑弹窗：统一间距 / 标题 / 说明 ---------- */
.modal.cbi-modal{ border-radius:16px; }
.modal.cbi-modal > h4{ margin:0 0 8px; padding:0 0 12px; font-size:18px; font-weight:600; border-bottom:1px solid var(--tc-line); }
.modal.cbi-modal .cbi-value{ padding:12px 0; margin:0; border-bottom:1px dashed var(--tc-line); }
.modal.cbi-modal .cbi-value-title{ font-weight:600; }
.modal.cbi-modal .cbi-dropdown[open] > ul.dropdown{ min-width:15rem; }

@media (max-width:640px){
	#status_bar, #tc-device-status, #cbi-timecontrol-timecontrol, #cbi-timecontrol-device{ padding:14px; }
}
`;

function injectStyle() {
	if (document.getElementById(TC_STYLE_ID))
		return;

	var el = document.createElement('style');
	el.id = TC_STYLE_ID;
	el.type = 'text/css';
	el.appendChild(document.createTextNode(TC_CSS));
	document.head.appendChild(el);
}

/* 下拉项标记：brief 常显，note 仅展开时显示 */
function richChoice(brief, note) {
	var children = [ E('span', { 'class': 'tc-brief' }, brief) ];

	if (note)
		children.push(E('span', { 'class': 'tc-note' }, note));

	return E('span', { 'class': 'tc-choice' }, children);
}

/* ================================================================== *
 * 服务 / 设备状态
 * ================================================================== */
function checkTimeControlProcess() {
	return fs.exec('/bin/ps', ['w']).then(function(res) {
		if (!res || res.code !== 0 || !res.stdout)
			return { running: false, pid: null };

		var lines = res.stdout.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.indexOf('timecontrolctrl') !== -1 && line.indexOf('grep') === -1) {
				var match = line.match(/^\s*(\d+)/);
				return { running: true, pid: match ? match[1] : null };
			}
		}
		return { running: false, pid: null };
	}).catch(function(err) {
		console.error('timecontrol status check error:', err);
		throw err;
	});
}

function readDeviceStatus() {
	return fs.read_direct('/var/run/timecontrol.status', 'text').then(function(txt) {
		var lines = (txt || '').split('\n').filter(function(l) { return l.length > 0; });
		if (!lines.length)
			return null;
		var ts = parseInt(lines[0], 10) || 0;
		var devices = {};
		for (var i = 1; i < lines.length; i++) {
			var f = lines[i].split('\t');
			devices[f[0]] = { state: f[2], reason: f[3] || '' };
		}
		return { ts: ts, devices: devices };
	}).catch(function() {
		return null;
	});
}

function pill(cls, text) {
	return E('span', { 'class': 'tc-pill ' + cls }, [ E('i'), text ]);
}

function renderDeviceStatus(table, st, running) {
	var devs = uci.sections('timecontrol', 'device').filter(function(d) {
		return d.enable === '1';
	});
	var now = Math.floor(Date.now() / 1000);
	var stale = !running || !st || (now - st.ts) > 180;

	var body = [];

	if (!devs.length)
		body.push(E('tr', {}, E('td', { 'class': 'tc-empty', 'colspan': 4 }, _('No enabled devices.'))));

	devs.forEach(function(d) {
		var info = (!stale && st.devices[d.mac]) ? st.devices[d.mac] : null;
		var stateEl, reason = '';

		if (!info) {
			stateEl = pill('tc-pill-wait', running ? _('Waiting for check') : _('Service not running'));
		}
		else if (info.state === 'allowed') {
			stateEl = pill('tc-pill-ok', _('Allowed'));
			reason = info.reason;
		}
		else {
			stateEl = pill('tc-pill-bad', _('Blocked'));
			reason = info.reason;
		}

		body.push(E('tr', {}, [
			E('td', {}, d.comment || '-'),
			E('td', { 'class': 'tc-mono' }, d.mac || '-'),
			E('td', {}, stateEl),
			E('td', {}, reason)
		]));
	});

	dom.content(table, [
		E('thead', {}, E('tr', {}, [
			E('th', { 'style': 'width:20%' }, _('Comment')),
			E('th', { 'style': 'width:24%' }, _('IP/MAC Address')),
			E('th', { 'style': 'width:18%' }, _('Internet Access')),
			E('th', {}, _('Reason'))
		])),
		E('tbody', {}, body)
	]);
}

function serviceStatusNodes(isRunning, pid) {
	var nodes = [ isRunning
		? pill('tc-pill-ok', _('TimeControl Service') + ' ' + _('RUNNING'))
		: pill('tc-pill-bad', _('TimeControl Service') + ' ' + _('NOT RUNNING')) ];

	if (isRunning && pid)
		nodes.push(E('span', { 'class': 'tc-pid' }, 'PID ' + pid));

	return nodes;
}

/* ================================================================== *
 * 控件：短标题 + 展开说明的下拉
 * ================================================================== */
var cbiRichListValue = form.ListValue.extend({
	renderWidget: function(section_id, option_index, cfgvalue) {
		var choices = this.transformChoices();
		var widget = new ui.Dropdown((cfgvalue != null) ? cfgvalue : this.default, choices, {
			id: this.cbid(section_id),
			sort: this.keylist,
			optional: true,
			select_placeholder: this.select_placeholder || this.placeholder,
			custom_placeholder: this.custom_placeholder || this.placeholder,
			validate: L.bind(this.validate, this, section_id),
			disabled: (this.readonly != null) ? this.readonly : this.map.readonly
		});

		return widget.render();
	},

	value: function(value, title, description) {
		if (description)
			form.ListValue.prototype.value.call(this, value, richChoice(title, description));
		else
			form.ListValue.prototype.value.call(this, value, title);
	}
});

/* ================================================================== *
 * 规则摘要
 * ================================================================== */
var TC_WEEK_SHORT = {
	'0': _('Everyday'),
	'1': _('Mon'),
	'2': _('Tue'),
	'3': _('Wed'),
	'4': _('Thu'),
	'5': _('Fri'),
	'6': _('Sat'),
	'7': _('Sun'),
	'1,2,3,4,5': _('Workday'),
	'6,7': _('Rest Day')
};

var TC_CYCLE_SHORT = {
	'daily': _('Daily'),
	'weekly': _('Weekly'),
	'monthly': _('Monthly'),
	'never': _('Never')
};

/* 摘要里把周期说完整一点，避免出现「每天（每天）」这种句子 */
var TC_CYCLE_SUMMARY = {
	'daily': _('reset daily'),
	'weekly': _('reset weekly'),
	'monthly': _('reset monthly'),
	'never': _('never reset')
};

function weekText(val) {
	var w = (val == null) ? '0' : String(val);

	if (TC_WEEK_SHORT[w])
		return TC_WEEK_SHORT[w];

	return w.split(',').map(function(x) {
		return TC_WEEK_SHORT[x.trim()] || x.trim();
	}).join('/');
}

function cycleText(val) {
	return TC_CYCLE_SUMMARY[String(val || 'daily')] || String(val || 'daily');
}

/* 把当前规则拆成几个片段：星期 / 时间段 / 时长 / 重置周期 */
function ruleParts(section_id, mode) {
	mode = mode || uci.get('timecontrol', section_id, 'time_mode') || 'period';

	var week = weekText(uci.get('timecontrol', section_id, 'week'));
	var start = uci.get('timecontrol', section_id, 'timestart') || '00:00';
	var end = uci.get('timecontrol', section_id, 'timeend') || '00:00';
	var duration = uci.get('timecontrol', section_id, 'duration') || '60';
	var cycle = cycleText(uci.get('timecontrol', section_id, 'reset_cycle'));
	var useDuration = uci.get('timecontrol', section_id, 'use_duration');

	var days = { cls: 'tc-seg-days', text: week };
	var time = { cls: 'tc-seg-time', text: (start === end) ? _('All day') : '%s-%s'.format(start, end) };
	var dur  = { cls: 'tc-seg-dur',  text: _('up to %s minutes').format(duration) };
	var cyc  = { cls: '',            text: cycle };

	if (mode === 'duration')
		return [ days, dur, cyc ];

	if (mode === 'combined' && useDuration === '1')
		return [ days, time, dur, cyc ];

	return [ days, time ];
}

/* 纯文本版本（标签渲染失败时的兜底，例如：每天, 最长 60 分钟, 每日重置） */
function ruleSummary(section_id, mode) {
	return ruleParts(section_id, mode).map(function(p) { return p.text; }).join(_(', '));
}

function paintSummary(cell, parts) {
	cell.textContent = '';
	cell.appendChild(E('div', { 'class': 'tc-summary' }, parts.map(function(p) {
		return E('span', { 'class': ('tc-seg ' + p.cls).trim() }, p.text);
	})));
}

/* 列表里改了控制方式 / 启用开关，摘要和行状态跟着变，省得再点一次「编辑」才看到 */
function bindRuleSummary(mapNode) {
	var rows = mapNode.querySelectorAll('#cbi-timecontrol-device tr.cbi-section-table-row');

	Array.prototype.forEach.call(rows, function(row) {
		var sid = row.getAttribute('data-sid'),
		    modeCell = row.querySelector('.td[data-name="time_mode"]'),
		    ruleCell = row.querySelector('.td[data-name="_rule"]'),
		    widget = modeCell ? modeCell.querySelector('.cbi-dropdown') : null,
		    enable = row.querySelector('.td[data-name="enable"] input[type="checkbox"]');

		if (ruleCell)
			paintSummary(ruleCell, ruleParts(sid));

		if (enable) {
			var mark = function() { row.classList.toggle('tc-row-off', !enable.checked); };
			enable.addEventListener('change', mark);
			mark();
		}

		if (!widget || !ruleCell)
			return;

		widget.addEventListener('cbi-dropdown-close', function() {
			var sel = widget.querySelector('li[selected]');

			if (sel)
				paintSummary(ruleCell, ruleParts(sid, sel.getAttribute('data-value')));
		});
	});
}

/* ================================================================== *
 * 页面
 * ================================================================== */
return view.extend({
	load: function() {
		return Promise.all([
			uci.load('timecontrol'),
			network.getHostHints()
		]);
	},

	render: function(data) {
		var m, s, o;
		var hosts = data[1] ? data[1].hosts : null;

		injectStyle();

		m = new form.Map('timecontrol', _('Internet Time Control'));

		/* ---------- 运行状态 + 简介 ---------- */
		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function() {
			var statusView = E('div', { 'id': 'service_status' },
				pill('tc-pill-wait', _('Checking service status...')));

			var refresh = function() {
				return checkTimeControlProcess()
					.then(function(res) {
						dom.content(statusView, serviceStatusNodes(res.running, res.pid));
					})
					.catch(function(err) {
						dom.content(statusView, pill('tc-pill-warn', _('Status check failed')));
						console.error('Status check error:', err);
					});
			};

			refresh();
			poll.add(refresh, 5);
			poll.start();

			return E('div', { 'class': 'cbi-section', 'id': 'status_bar' }, [
				E('div', { 'class': 'tc-hero-head' }, [
					statusView,
					E('div', { 'class': 'tc-hero-links' }, [
						E('span', {}, _('Suggested feedback:')),
						E('a', { 'href': 'https://github.com/sirpdboy/luci-app-timecontrol.git', 'target': '_blank', 'rel': 'noreferrer' }, 'GitHub @timecontrol'),
						E('span', {}, [
							_('© github '),
							E('a', { 'href': 'https://github.com/sirpdboy', 'target': '_blank', 'rel': 'noreferrer' }, 'by sirpdboy')
						])
					])
				]),
				E('p', { 'class': 'tc-lead' },
					_('Limit internet time for each device by IP or MAC address. Rules below apply in blacklist mode.'))
			]);
		};

		/* ---------- 已启用设备当前状态 ---------- */
		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function() {
			var table = E('table', { 'class': 'tc-table', 'id': 'device_status_table' });
			var update = function() {
				return Promise.all([
					readDeviceStatus(),
					checkTimeControlProcess().catch(function() { return { running: false }; })
				]).then(function(r) { renderDeviceStatus(table, r[0], r[1].running); });
			};

			update();
			poll.add(update, 10);

			return E('div', { 'class': 'cbi-section', 'id': 'tc-device-status' }, [
				E('h3', _('Enabled Devices Status')),
				E('div', { 'class': 'cbi-section-descr' },
					_('Shows whether each enabled device is currently allowed to access the internet. Refreshes automatically.')),
				table
			]);
		};

		/* ---------- 全局设置 ---------- */
		s = m.section(form.TypedSection, 'timecontrol', _('Global Settings'),
			_('Global behaviour of the time control service.'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(cbiRichListValue, 'list_type', _('Control Mode'));
		o.rmempty = false;
		o.value('blacklist', _('Blacklist'),
			_('Block the networking of the listed addresses.'));
		// o.value('whitelist', _('Whitelist'),
		//	_('Only allow the listed addresses, block everything else.'));
		o.default = 'blacklist';

		o = s.option(cbiRichListValue, 'chain', _('Control Intensity'));
		o.value('forward', _('Ordinary forward control'),
			_('Only internet access is controlled, the device can still reach the router.'));
		o.value('input', _('Strong input control'),
			_('Controlled devices can no longer reach the router itself either.'));
		o.default = 'forward';
		o.rmempty = false;

		o = s.option(cbiRichListValue, 'log_level', _('Log Level'));
		o.value('silent', _('Silent'), _('Do not write any log entries.'));
		o.value('info', _('Info'), _('Only key events, recommended for daily use.'));
		o.value('debug', _('All (Debug)'), _('Include debug messages, log grows fast.'));
		o.default = 'info';
		o.rmempty = false;
		o.description = _('The log is cleared automatically every 3 days.');

		/* ---------- 设备规则 ---------- *
		 * 列表只放 备注 / 启用 / 地址 / 控制方式 / 规则摘要 五列，
		 * 时间细节全部收进「编辑」弹窗，避免表格被长选项撑出页面。 */
		var useGrid = !!form.GridSection;
		var SecClass = useGrid ? form.GridSection : form.TableSection;

		s = m.section(SecClass, 'device', _('Device Rules'),
			_('Time period control: internet access is only allowed inside the configured period.') + '<br/>' +
			_('Duration control: internet access is allowed for a limited number of minutes.') + '<br/>' +
			_('Combined control: limit the duration inside the allowed time period.'));
		s.addremove = true;
		s.anonymous = true;
		s.sortable = false;
		s.nodescriptions = true;
		s.addbtntitle = _('Add Device Rule');

		/* 列表内可直接编辑的字段 */
		o = s.option(form.Value, 'comment', _('Comment'));
		o.optional = true;
		o.placeholder = _('Description');
		o.editable = true;

		o = s.option(form.Flag, 'enable', _('Enabled'));
		o.rmempty = false;
		o.default = '1';
		o.editable = true;

		o = s.option(form.Value, 'mac', _('IP/MAC Address'));
		o.rmempty = false;
		o.editable = true;
		o.placeholder = _('192.168.10.100 or 00:11:22:33:44:55');
		o.tooltip = _('A single IP, a MAC address or an IP range like 192.168.10.20-192.168.10.30 may be entered manually.');

		if (hosts) {
			var ipChoices = [], macChoices = [], seen = {};

			Object.keys(hosts).forEach(function(mac) {
				var host = hosts[mac];
				if (!host)
					return;

				var name = host.name || '';
				var addrs = L.toArray(host.ipaddrs || host.ipv4 || []);

				addrs.forEach(function(ip) {
					if (!ip || seen['ip:' + ip])
						return;
					seen['ip:' + ip] = true;
					ipChoices.push({
						value: ip,
						brief: ip,
						note: 'MAC %s%s'.format(mac, name ? ' · ' + name : '')
					});
				});

				if (mac && !seen['mac:' + mac]) {
					seen['mac:' + mac] = true;
					macChoices.push({
						value: mac,
						brief: String(mac).toUpperCase(),
						note: '%s%s'.format(addrs.length ? 'IP %s'.format(addrs[0]) : '',
							name ? (addrs.length ? ' · ' : '') + name : '')
					});
				}
			});

			var natCompare = L.naturalCompare || function(a, b) { return String(a).localeCompare(String(b)); };

			ipChoices.sort(function(a, b) { return natCompare(a.value, b.value); });
			macChoices.sort(function(a, b) { return natCompare(a.brief, b.brief); });

			ipChoices.concat(macChoices).forEach(function(c) {
				o.value(c.value, richChoice(c.brief, c.note));
			});
		}

		o = s.option(cbiRichListValue, 'time_mode', _('Time Control Mode'));
		o.value('period', _('Time Period Control'),
			_('Allow internet access only inside the configured time period.'));
		o.value('duration', _('Allow Duration Control'),
			_('Allow internet access for the given amount of minutes after the device goes online.'));
		o.value('combined', _('Combined Control'),
			_('Allow access inside the time period and additionally limit the duration within it.'));
		o.default = 'period';
		o.rmempty = false;
		o.editable = true;

		/* 规则摘要：列表里的只读一列，让表格保持苗条 */
		o = s.option(form.DummyValue, '_rule', _('Rule Summary'));
		o.modalonly = false;
		o.cfgvalue = function(section_id) { return ruleSummary(section_id); };
		o.textvalue = function(section_id) { return ruleSummary(section_id); };

		/* 以下细节只在「编辑」弹窗中出现 */
		var modal = function(cls, name, title, description) {
			var opt = s.option(cls, name, title, description);
			if (useGrid)
				opt.modalonly = true;
			return opt;
		};

		o = modal(form.Value, 'timestart', _('Allow Start Time'),
			_('Start of the time period in which internet access is allowed.'));
		o.placeholder = '00:00';
		o.default = '00:00';
		o.validate = function(section_id, value) {
			if (value === '' || /^([01]?\d|2[0-3]):[0-5]\d$/.test(value))
				return true;
			return _('Time format must be HH:MM (00:00 - 23:59)');
		};
		o.depends('time_mode', 'period');
		o.depends('time_mode', 'combined');

		o = modal(form.Value, 'timeend', _('Allow End Time'),
			_('End of the time period in which internet access is allowed.'));
		o.placeholder = '00:00';
		o.default = '00:00';
		o.validate = function(section_id, value) {
			if (value === '' || /^([01]?\d|2[0-3]):[0-5]\d$/.test(value))
				return true;
			return _('Time format must be HH:MM (00:00 - 23:59)');
		};
		o.depends('time_mode', 'period');
		o.depends('time_mode', 'combined');

		o = modal(form.Value, 'duration', _('Allowed Duration (minutes)'),
			_('Minutes of internet access after the device goes online, access is blocked afterwards.'));
		o.placeholder = '60';
		o.default = '60';
		o.datatype = 'min(1)';
		o.depends('time_mode', 'duration');
		o.depends('time_mode', 'combined');

		o = modal(cbiRichListValue, 'reset_cycle', _('Reset Cycle'),
			_('How often the used duration counter is reset.'));
		o.value('daily', _('Daily'), _('Reset the counter every day.'));
		o.value('weekly', _('Weekly'), _('Reset the counter every week.'));
		o.value('monthly', _('Monthly'), _('Reset the counter every month.'));
		o.value('never', _('Never'), _('Never reset automatically, reset manually instead.'));
		o.default = 'daily';
		o.depends('time_mode', 'duration');
		o.depends('time_mode', 'combined');

		o = modal(form.Flag, 'use_duration', _('Enable Duration Limit in Period'),
			_('Also limit the total online duration inside the allowed time period.'));
		o.default = '0';
		o.depends('time_mode', 'combined');

		o = modal(form.Value, 'week', _('Week Day (1~7)'),
			_('Days on which the rule applies, e.g. 1,2,3,4,5 for workdays.'));
		o.value('0', _('Everyday'));
		o.value('1', _('Mon'));
		o.value('2', _('Tue'));
		o.value('3', _('Wed'));
		o.value('4', _('Thu'));
		o.value('5', _('Fri'));
		o.value('6', _('Sat'));
		o.value('7', _('Sun'));
		o.value('1,2,3,4,5', _('Workday'));
		o.value('6,7', _('Rest Day'));
		o.placeholder = _('Everyday');
		o.default = '0';
		o.rmempty = false;

		return Promise.resolve(m.render()).then(function(nodes) {
			try {
				bindRuleSummary(nodes);
			}
			catch (err) {
				console.error('timecontrol: bind rule summary failed:', err);
			}

			return nodes;
		});
	}
});
