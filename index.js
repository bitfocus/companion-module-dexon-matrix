var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
	self.init_tcp();

};

instance.prototype.init = function() {
	var self = this;

		debug = self.debug;
		log = self.log;

	self.init_presets();
	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'TCP Port (Default: 6464)',
			width: 4,
			default: 6464,
			regex: self.REGEX_PORT
		},
		{
			type: 'dropdown',
			id: 'need_ack',
			label: 'Need ACK:',
			default: 'Yes',
			choices: [
				{ id: 'Yes', label: 'Yes' },
				{ id: 'No', label: 'No' },
			]
		},
		{
			type: 'text',
			id: 'info',
			label: 'Information',
			width: 12,
			value: 'Please type in your user credentials:'
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'Username',
			width: 4,
			default: 'Administrator'
		},
		{
			type: 'textinput',
			id: 'pass',
			label: 'Password',
			width: 4,
			default: ''
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.CHOICES_COMMANDS = [
	{ id: 'login',							label: 'Force Login'},
	{ id: 'rename_user_preset', label: 'Rename User Preset'},
	{ id: 'rename_layout', 			label: 'Rename Layout'},
	{ id: 'connect_video', 			label: 'Connect Video'},
	{ id: 'connect_audio', 			label: 'Connect Audio'},
	{ id: 'disconnect_video', 	label: 'Disconnect Video'},
	{ id: 'disconnect_audio',		label: 'Disconnect Audio'},
];

instance.prototype.CHOICES_ACTIONS = [
	{ id: 'user_presets_action', label: 'Recall Preset',	value: 'recall'},
	{ id: 'user_presets_action', label: 'Save Preset', 		value: 'save'},
	{ id: 'user_presets_action', label: 'Clear Preset', 	value: 'clear'},
	{ id: 'layout_action', label: 'Recall Layout', 	value: 'recall'},
	{ id: 'layout_action', label: 'Save Layout', 		value: 'save'},
	{ id: 'layout_action', label: 'Clear Layout', 	value: 'clear'},
];

instance.prototype.CHOICES_SYSTEM = [
	{ id: 'reboot', 	label: 'Reboot' },
	{ id: 'wakeup', 	label: 'Wake Up' },
	{ id: 'standby', 	label: 'Standby' },
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '14';

	for (var input in self.CHOICES_COMMANDS) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_COMMANDS[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: self.CHOICES_COMMANDS[input].id, 
			}],
		});
	}

	for (var input in self.CHOICES_ACTIONS) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_ACTIONS[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_ACTIONS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: self.CHOICES_ACTIONS[input].id, 
				options: {
					action: self.CHOICES_ACTIONS[input].value,
				}
			}]
		});
	}

	for (var input in self.CHOICES_SYSTEM) {
		presets.push({
			category: 'System',
			label: self.CHOICES_SYSTEM[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_SYSTEM[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{	
				action: self.CHOICES_SYSTEM[input].id, 
			}]
		});
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.CHOICES_PRESETS = [
	{ id: 'recall', label: 'Recall Preset' },
	{ id: 'save', 	label: 'Save Preset' },
	{ id: 'clear', 	label: 'Clear Preset' },
];

instance.prototype.CHOICES_LAYOUT = [
	{ id: 'recall', label: 'Recall Layout' },
	{ id: 'save', 	label: 'Save Layout' },
	{ id: 'clear', 	label: 'Clear Layout' },
];

instance.prototype.CHOICES_INPUTS = [
	{ id: '1', 	label: 'Input 1' },
	{ id: '2', 	label: 'Input 2' },
	{ id: '3', 	label: 'Input 3' },
	{ id: '4', 	label: 'Input 4' },
	{ id: '5', 	label: 'Input 5' },
	{ id: '6', 	label: 'Input 6' },
	{ id: '7', 	label: 'Input 7' },
	{ id: '8', 	label: 'Input 8' },
];

instance.prototype.CHOICES_OUTPUTS = [
	{ id: '1', 	label: 'Output 1' },
	{ id: '2', 	label: 'Output 2' },
	{ id: '3', 	label: 'Output 3' },
	{ id: '4', 	label: 'Output 4' },
];

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'login': {
			label: 'Force Login',
			options: [{
				type: 'text',
				id: 'info_login',
				width: 12,
				label: 'Information',
				value: 'Please setup username and password in the config tab.'
			}]
		},
		'user_presets_action': {
			label: 'User Preset Actions',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Action',
					default: 'recall',
					choices: self.CHOICES_PRESETS
				},
				{
					type: 'number',
					id: 'id',
					label: 'Preset ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
			]
		},
		'layout_action': {
			label: 'Layout Actions',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Action',
					default: 'recall',
					choices: self.CHOICES_LAYOUT
				},
				{
					type: 'number',
					id: 'id',
					label: 'Layout ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
			]
		},
		'rename_user_preset': {
			label: 'Rename User Preset',
			options: [
				{
					type: 'number',
					id: 'rename_id',
					label: 'Recall Preset ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					id: 'name',
					label: 'Preset Name',
					default: ''
				}
			]
		},
		'rename_layout': {
			label: 'Rename Layout',
			options: [
				{
					type: 'number',
					id: 'rename_id',
					label: 'Layout ID:',
					min: 1,
					max: 256,
					default: 1,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					id: 'name',
					label: 'Layout Name',
					default: ''
				}
			]
		},
		'connect_video': {
			label: 'Connect Video',
			options: [
				{
					type: 'dropdown',
					id: 'input_id',
					label: 'Input ID:',
					default: 1,
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'output_id',
					label: 'Output ID:',
					default: 1,
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					default: 'MAIN',
					choices: [
						{ id: 'PIP', label: 'PIP' },
						{ id: 'MAIN', label: 'Main' },
					]
				}
			]
		},
		'connect_audio': {
			label: 'Connect Audio',
			options: [
				{
					type: 'dropdown',
					id: 'input_id',
					label: 'Input ID:',
					default: 1,
					choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'output_id',
					label: 'Output ID:',
					default: 1,
					choices: self.CHOICES_OUTPUTS
				}
			]
		},
		'disconnect_video': {
			label: 'Disconnect Video',
			options: [
				{
					type: 'dropdown',
					id: 'output_id',
					label: 'Output ID:',
					default: 1,
					choices: self.CHOICES_OUTPUTS
				},
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					default: 'MAIN',
					choices: [
						{ id: 'PIP', label: 'PIP' },
						{ id: 'MAIN', label: 'Main' },
					]
				}
			]
		},
		'disconnect_audio': {
			label: 'Disconnect Audio',
			options: [
				{
					type: 'dropdown',
					id: 'output_id',
					label: 'Output ID:',
					default: 1,
					choices: self.CHOICES_OUTPUTS
				}
			]
		},
		'reboot': {
			label: 'Reboot Matrix',
			options: [{
				type: 'text',
				id: 'info_reboot',
				width: 12,
				label: 'Information',
				value: 'Reboots the DEXON Matrix unit'
			}]
		},
		'wakeup': {
			label: 'Wake Up Matrix',
			options: [{
				type: 'text',
				id: 'info_wakeup',
				width: 12,
				label: 'Information',
				value: 'Wakes the DEXON Matrix up from standby mode'
			}]
		},
		'standby': {
			label: 'Set Matrix To Standby',
			options: [{
				type: 'text',
				id: 'info_standby',
				width: 12,
				label: 'Information',
				value: 'Puts the DEXON Matrix in standby mode'
			}]
		},
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var MD5 = function(d){result = M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_};
	var login = '<setup version="1" > <username>' + self.config.user + '</username> <password>' + MD5(self.config.pass) + '</password> <needack>' + self.config.need_ack + '</needack> </setup> ';

	switch(action.action) {

		case 'login':
			cmd = login;
			break;

		case 'user_preset_action':
			cmd = login + '<' + action.options.action + '_preset id="' + action.options.id + '" needack="' + self.config.need_ack + '"/>';
			break;

		case 'layout_action':
			cmd = login + '<' + action.options.action + '_layout id="' + action.options.id + '" needack="' + self.config.need_ack + '"/>';
			break;	

		case 'rename_user_preset':
			cmd = login + '<rename_preset id="' + action.options.rename_id + '" needack="Yes" name="' + action.options.name + '"/>';
			break;
	
		case 'rename_layout':
			cmd = login + '<rename_layout id="' + action.options.rename_id + '" needack="Yes" name="' + action.options.name + '"/>';
			break;

		case 'connect_video':
			cmd = login + '<video><connect input_id="' + action.options.input_id + '" output_id="' + action.options.output_id + '" channel="' + action.options.channel + '"/></video>';
			break;

		case 'connect_audio':
			cmd = login + '<audio><connect input_id="' + action.options.input_id + '" output_id="' + action.options.output_id + '"/></audio>';
			break;

		case 'disconnect_video':
			cmd = login + '<video><disconnect output_id="' + action.options.output_id + '" channel="' + action.options.channel + '"/></video>';
			break;
			
		case 'disconnect_audio':
			cmd = login + '<audio><disconnect output_id="' + action.options.output_id + '"/></audio>';
			break;
			
		case 'reboot':
			cmd = login + '<reboot needack="' + self.config.need_ack + '"/>';
			break;

		case 'wakeup':
			cmd = login + '<wake_up needack="' + self.config.need_ack + '"/>';
			break;

		case 'standby':
			cmd = login + '<standby needack="' + self.config.need_ack + '"/>';
			break;
	}

	if (cmd !== undefined) {

			debug('sending ',cmd,"to",self.config.host);

			if (self.socket !== undefined && self.socket.connected) {
					self.socket.send(cmd);
			}
			else {
					debug('Socket not connected :(');
			}
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
