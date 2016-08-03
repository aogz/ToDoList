
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gettext = imports.gettext.domain('gnome-shell');
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const _ = Gettext.gettext;


const Extension = imports.misc.extensionUtils.getCurrentExtension();
const RenameDialog = Extension.imports.gui_elements.rename_dialog.RenameDialog;
const debug = Extension.imports.utils.debug;

const BUTTON_RELEASE = 7;

// TaskItem object
function TaskItem(parent_menu, name){
	this.conn = null;
	this._init(parent_menu, name);
}

TaskItem.prototype = {
	__proto__ : PopupMenu.PopupBaseMenuItem.prototype,
	_init: function(parent_menu, name){
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this);
		this.name = name;
		this.parent_menu = parent_menu;
		this.actor.add_style_class_name('task-item');
		let logo = new St.Icon({icon_size: 10, icon_name: 'emblem-unreadable' });
		let supr_btn = new St.Button({ style_class: 'task-supr', label: '',} );
		this.label = new St.Label({ 
			style_class: 'task-label', 
			text: name
		} );
		supr_btn.add_actor(logo)
		this.actor.add_actor(this.label);
		this.actor.add_actor(supr_btn);

		// Connections
		this.actor.connect('event',
						   Lang.bind(this, this._clicked));
		supr_btn.connect('clicked',
						 Lang.bind(this, this._supr_call));
	},
	_clicked : function(actor, ev){
		if(ev.type() != BUTTON_RELEASE)
			return;
		var double_click = ev.get_click_count() == 2;

		// Add rename on double click
		if (double_click){
			debug('Double click task!');
			this.parent_menu.close();
			let mod = new RenameDialog(this.name);
			mod.set_callback(Lang.bind(this, this._rename));
			mod.open();
		}
	},
	_destroy: function(){
		if(this.conn != null)
			this._supr_btn.disconnect(this.conn);
	},
	isEntry: function(){
		return false;
	},
	_rename : function(name){
		if(name == this.name || name.length == 0){
			return
		}

		// Emit signal so todolist clean up
		this.emit('name_changed', this.name, name);

		// Change the class variables
		this.label.set_text(name)

	},
	_supr_call : function(){
		debug('Emit supr signal')
		this.emit('supr_signal', this.name);
	}
}