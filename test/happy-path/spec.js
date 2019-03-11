const test = require('ava')
const execa = require('execa')
const {normalizeTapOutput} = require('../utils')
const {
	TestFailureException,
	MissingCssException
} = require('../../lib/exceptions')

test('it reports a success if all assertions pass with CSS via stdIn', async t => {
	const {code, stdout} = await execa('../../lib/cli.js', {
		input: 'body {\n\tcolor: blue;\n}\n',
		cwd: __dirname
	})

	t.is(code, 0)
	t.snapshot(normalizeTapOutput(stdout))
})

test('it reports a success if all assertions pass with a CSS file path as an argument', async t => {
	const {stdout, code} = await execa(
		'../../lib/cli.js',
		['fixture-success.css'],
		{
			cwd: __dirname
		}
	)
	t.is(code, 0)
	t.snapshot(normalizeTapOutput(stdout))
})

test('it reports a failure if some assertions are exceeded', async t => {
	const {code, stdout} = await t.throwsAsync(
		execa('../../lib/cli.js', {
			input: 'body {\n\tcolor: green;\n\tmargin: 0;\n}\n',
			cwd: __dirname
		})
	)

	t.is(code, TestFailureException.code)
	t.snapshot(normalizeTapOutput(stdout))
})

test('it reports an error if no css is passed but a .constyble is present', async t => {
	const {stderr, code} = await t.throwsAsync(
		execa('../../lib/cli.js', {input: '', cwd: __dirname})
	)

	t.is(code, MissingCssException.code)
	t.snapshot(stderr)
})

test('it handles invalid css', async t => {
	const {code} = await t.throwsAsync(
		execa('../../lib/cli.js', {cwd: __dirname, input: 'a'})
	)

	t.is(code, 1)
})

test('it skips assertions when the config value is set to false or -1', async t => {
	const {code, stdout} = await execa(
		'../../lib/cli.js',
		['--config', '.constyblerc-with-skip'],
		{
			input: 'body {\n\tcolor: blue; color: green;\n}\n',
			cwd: __dirname
		}
	)

	t.is(code, 0)
	t.snapshot(normalizeTapOutput(stdout))
})
