const path = require('path');
const { task, src, dest, parallel } = require('gulp');

task('build:icons', copyIcons);
task('build:js', copyJsFiles);
task('build:assets', parallel(copyIcons, copyJsFiles));

function copyIcons() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	return src(credSource).pipe(dest(credDestination));
}

function copyJsFiles() {
	const jsSource = path.resolve('nodes', '**', '*.js');
	const jsDestination = path.resolve('dist', 'nodes');

	return src(jsSource).pipe(dest(jsDestination));
}
