'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require fs';

var callService = rpc.declare({
	object: 'rc',
	method: 'init',
	params: [ 'name', 'action' ],
	expect: { result: false }
});

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('homebox'),
			callServiceList('homebox'),
			fs.stat('/usr/bin/homebox').catch(function() {
				return null;
			})
		]);
	},

	isRunning: function(res) {
		return !!(
			res &&
			res.homebox &&
			res.homebox.instances &&
			Object.keys(res.homebox.instances).length
		);
	},

	render: function(data) {
		var m, s, o;
		var running = this.isRunning(data[1]);
		var binaryInstalled = !!data[2];

		m = new form.Map(
			'homebox',
			_('HomeBox'),
			_('家庭局域网测速工具。')
		);

		s = m.section(
			form.NamedSection,
			'config',
			'homebox',
			_('HomeBox 服务')
		);

		o = s.option(
			form.DummyValue,
			'_status',
			_('状态')
		);

		o.rawhtml = true;
		o.cfgvalue = function() {
			return '<span class="label ' +
				(running ? 'success' : 'warning') +
				'">' +
				(running ? _('运行中') : _('已停止')) +
				'</span>';
		};

		o = s.option(
			form.DummyValue,
			'_binary',
			_('二进制状态（homebox）')
		);

		o.rawhtml = true;
		o.cfgvalue = function() {
			var status = binaryInstalled
				? '<span class="label success">' + _('已安装') + '</span>'
				: '<span class="label warning">' + _('未安装') + '</span>';
			var path = '<code>/usr/bin/homebox</code>';
			var hint = binaryInstalled ? '' : '（请手动安装二进制文件）';
			return status + ' ' + path + hint;
		};

		o = s.option(
			form.Flag,
			'enabled',
			_('服务控制 (点击开启/关闭)')
		);

		o.rmempty = false;

		o.onchange = function(ev, section_id, value) {
			var action = value ? 'start' : 'stop';

			return callService('homebox', action).then(function() {
				running = !!value;
				var el = document.querySelector(
					'.cbi-value-field[data-name="_status"]'
				);

				if (el)
					el.innerHTML = '<span class="label ' +
						(running ? 'success' : 'warning') +
						'">' +
						(running ? _('运行中') : _('已停止')) +
						'</span>';
			});
		};

		o = s.option(
			form.Value,
			'port',
			_('端口')
		);

		o.datatype = 'port';
		o.default = '3300';
		o.rmempty = false;

		o = s.option(
			form.DummyValue,
			'_open',
			_('HomeBox 网页')
		);

		o.rawhtml = true;
		o.cfgvalue = function() {
			var port = uci.get('homebox', 'config', 'port') || '3300';
			var host = window.location.hostname;

			return E(
				'a',
				{
					'class': 'btn cbi-button cbi-button-action',
					'href': 'http://' + host + ':' + port,
					'target': '_blank'
				},
				_('打开 HomeBox 网页')
			);
		};

		return m.render();
	},

	handleSaveApply: function(ev) {
		return this.super('handleSaveApply', [ ev ]).then(function() {
			return callService('homebox', 'reload');
		});
	},

	handleSave: function(ev) {
		return this.super('handleSave', [ ev ]).then(function() {
			return callService('homebox', 'reload');
		});
	}
});
