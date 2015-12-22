'use strict';
const _ = require('lodash');
const url = require('url');
const urljoin = require('url-join');
const debug = require('debug')('jt.fileimporter');

class Importer {
	constructor(options) {
		this._options = _.clone(options || {});
		this._cssFiles = [];
		this._jsFiles = [];
	}

	set prefix(v) {
		this._options.prefix = v;
		return this;
	}

	get prefix() {
		return this._options.prefix;
	}

	set hosts(v) {
		const options = this._options;
		if (v) {
			/* istanbul ignore else */
			if (!_.isArray(v)) {
				v = [v];
			}
			options.hosts = v;
		} else {
			options.hosts = null;
		}
		return this;
	}

	get hosts() {
		return this._options.hosts;
	}

	set version(v) {
		this._options.version = v;
		return this;
	}

	get version() {
		return this._options.version;
	}


	set versionMode(v) {
		this._options.versionMode = v;
		return this;
	}

	get versionMode() {
		return this._options.versionMode;
	}

	/**
	 * [import 引入文件，参数支持String, Arrray和多参数的形式]
	 * @return {[type]} [description]
	 */
	import () {
		const files = _.flattenDeep(_.toArray(arguments));
		_.forEach(files, file => {
			file = file.trim();
			if (!file) {
				return;
			}
			const urlInfo = url.parse(file);
			const ext = extname(urlInfo.pathname);
			if (ext === '.js') {
				this._importFile(file, 'js');
			} else {
				this._importFile(file, 'css');
			}
		});
	}

	/**
	 * [exportCss 输出css标签列表]
	 * @return {[type]} [description]
	 */
	exportCss() {
		return this._exportFile('css');
	}

	/**
	 * [exportJs 输出js标签列表]
	 * @return {[type]} [description]
	 */
	exportJs() {
		return this._exportFile('js');
	}


	/**
	 * [_importFile description]
	 * @param  {[type]} file [description]
	 * @param  {[type]} type [description]
	 * @return {[type]}      [description]
	 */
	_importFile(file, type) {
		debug('import type:%s, file:%s', type, file);
		const files = type === 'js' ? this._jsFiles : this._cssFiles;
		/* istanbul ignore else */
		if (!~_.indexOf(files, file)) {
			files.push(file);
		}
		return this;
	}

	/**
	 * [_exportFile 输出对应类型的html]
	 * @param  {[type]} type [description]
	 * @return {[type]}      [description]
	 */
	_exportFile(type) {
		const files = type === 'js' ? this._jsFiles : this._cssFiles;
		const htmlArr = _.map(files, file => {
			const fileUrl = this._getUrl(file);
			if (type === 'js') {
				return '<script type="text/javascript" src="' + fileUrl + '"></script>';
			} else {
				return '<link rel="stylesheet" href="' + fileUrl + '" type="text/css" />';
			}
		});
		return htmlArr.join('');
	}

	/**
	 * [_getUrl 获取引入文件的url]
	 * @param  {[type]} file [description]
	 * @return {[type]}      [description]
	 */
	_getUrl(file) {
		if (isRejected(file)) {
			return file;
		}

		const version = this.version;
		/* istanbul ignore else */
		if (version) {
			if (_.isString(version)) {
				file = this._joinVersion(file, version);
			} else if (_.isObject(version)) {
				const v = version[file] || version['default'];
				/* istanbul ignore else */
				if (v) {
					file = this._joinVersion(file, v);
				}
			}
		}

		const hosts = this.hosts;
		const prefix = this.prefix;
		if (prefix) {
			file = urljoin(prefix, file);
		}

		if (hosts && hosts.length) {
			const host = hosts[file.length % hosts.length];
			file = '//' + urljoin(host, file);
		}
		return file;
	}

	/**
	 * [_joinVersion 为文件添加版本号]
	 * @param  {[type]} file [description]
	 * @param  {[type]} v    [description]
	 * @return {[type]}      [description]
	 */
	_joinVersion(file, v) {
		if (this.versionMode === 1) {
			const ext = extname(file);
			return file.substring(0, file.length - ext.length) + '.' + v + ext;
		} else {
			return file + '?v=' + v;
		}
	}
}


/**
 * [extname 获取文件后缀]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function extname(file) {
	/* istanbul ignore if */
	if (!file) {
		return '';
	}
	const arr = file.split('.');
	/* istanbul ignore if */
	if (arr.length === 1) {
		return '';
	} else {
		return '.' + _.last(arr);
	}
}


/**
 * [isRejected 如果是外部js，则reject]
 * @param  {[type]}  fileUrl [description]
 * @return {Boolean}         [description]
 */
function isRejected(fileUrl) {
	return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
}

module.exports = Importer;