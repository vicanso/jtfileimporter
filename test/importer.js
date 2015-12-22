'use strict';
const assert = require('assert');
const Importer = require('..');
const util = require('util');
describe('Importer', () => {
	it('should new Importer success', () => {
		const importer = new Importer();
		assert(util.isObject(importer._options));
		assert(util.isArray(importer._jsFiles));
		assert(util.isArray(importer._cssFiles));
	});

	it('should set prefix success', () => {
		const importer = new Importer();
		importer.prefix = '/albi';
		assert.equal(importer._options.prefix, '/albi');
		assert.equal(importer.prefix, '/albi');
	});


	it('should set hosts success', () => {
		const importer = new Importer();
		assert(!importer.hosts);
		importer.hosts = 'albi.io';
		assert.equal(importer.hosts.join(), 'albi.io');
		importer.hosts = null;
		assert(!importer.hosts);
	});


	it('should set version success', () => {
		const importer = new Importer();
		assert(!importer.version);
		importer.version = '2015-12-25';
		assert.equal(importer.version, '2015-12-25');

		importer.version = {
			'/a.js': '1234',
			'/b.css': '4567',
			'default': '2015-12-25'
		};
		assert.equal(importer.version['/a.js'], '1234');
		assert.equal(importer.version['/b.css'], '4567');
		assert.equal(importer.version['default'], '2015-12-25');
	});

	it('should set versionMode success', () => {
		const importer = new Importer();
		assert(!importer.versionMode);

		importer.versionMode = 1;
		assert.equal(importer.versionMode, 1);

	});

	it('should import file success', () => {
		const importer = new Importer();
		importer.import('/a.css', '/b.js');
		assert.equal(importer._cssFiles.join(), '/a.css');
		assert.equal(importer._jsFiles.join(), '/b.js');

		importer.import(['/c.css']);
		importer.import('/d.js');
		importer.import('/d.js');
		importer.import('');

		assert.equal(importer._cssFiles.join(), '/a.css,/c.css');
		assert.equal(importer._jsFiles.join(), '/b.js,/d.js');
	});


	it('should export file success, no version setting', () => {
		const importer = new Importer();
		importer.import('/a.css', '/b.js');

		assert.equal(importer.exportCss(), '<link rel="stylesheet" href="/a.css" type="text/css" />');
		assert.equal(importer.exportJs(), '<script type="text/javascript" src="/b.js"></script>');
	});

	it('should export file success, with version setting', () => {
		const imp1 = new Importer();
		imp1.import('/a.css', '/b.js');

		imp1.version = {
			'/a.css': 1234,
			'default': 5678
		};

		assert.equal(imp1.exportCss(), '<link rel="stylesheet" href="/a.css?v=1234" type="text/css" />');
		assert.equal(imp1.exportJs(), '<script type="text/javascript" src="/b.js?v=5678"></script>');

		const imp2 = new Importer();
		imp2.import('/a.css', '/b.js');
		imp2.version = '2015-12-25';
		assert.equal(imp2.exportCss(), '<link rel="stylesheet" href="/a.css?v=2015-12-25" type="text/css" />');
		assert.equal(imp2.exportJs(), '<script type="text/javascript" src="/b.js?v=2015-12-25"></script>');


		const imp3 = new Importer();
		imp3.import('/a.css');
		imp3.version = {
			'/a.css': 1234
		};
		imp3.versionMode = 1;

		assert.equal(imp3.exportCss(), '<link rel="stylesheet" href="/a.1234.css" type="text/css" />');

	});

	it('should export external file success', () => {
		const importer = new Importer();
		importer.import('http://www.baidu.com/a.css', '//www.baidu.com/b.js');

		importer.version = '2015-12-25';

		assert.equal(importer.exportCss(), '<link rel="stylesheet" href="http://www.baidu.com/a.css" type="text/css" />');
		assert.equal(importer.exportJs(), '<script type="text/javascript" src="//www.baidu.com/b.js"></script>');

	});

	it('should export file success with prefix', () => {
		const importer = new Importer();

		importer.prefix = '/albi';

		importer.import('/a.css');

		assert.equal(importer.exportCss(), '<link rel="stylesheet" href="/albi/a.css" type="text/css" />');
	});

	it('should export file success with multi host', () => {
		const importer = new Importer();
		importer.hosts = [
			'1.cdn.com',
			'2.cdn.com'
		];

		importer.import('/a.css');
		importer.import('/b.js', '/ab.js');


		assert.equal(importer.exportCss(), '<link rel="stylesheet" href="//1.cdn.com/a.css" type="text/css" />');
		assert.equal(importer.exportJs(), '<script type="text/javascript" src="//2.cdn.com/b.js"></script><script type="text/javascript" src="//1.cdn.com/ab.js"></script>');
	});

});