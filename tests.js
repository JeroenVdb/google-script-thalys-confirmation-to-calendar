const rewire = require('rewire');
const assert = require('assert');

const app = rewire('./index.js');
getTrajactFromThalysEmail = app.__get__('getTrajactFromThalysEmail');
getDepartureDatetimeFromThalysEmail = app.__get__('getDepartureDatetimeFromThalysEmail');
isThalysEmail = app.__get__('isThalysEmail');
createThalysJourney = app.__get__('createThalysJourney');
getTravelTimeFromThalysEmail = app.__get__('getTravelTimeFromThalysEmail');
init = app.__get__('init');

var threadRotterdam = {
	getFirstMessageSubject: function () {
		return 'Confirmation of Thalys booking : ROTTERDAM CENTRAAL -> BRUXELLES MIDI 26/02/2020 16:58'
	}
};
var threadAmsterdam = {
	getFirstMessageSubject: function () {
		return 'Confirmation of Thalys booking : AMSTERDAM CENTRAAL -> BRUXELLES MIDI 26/02/2020 16:58'
	}
};
var threadParis = {
	getFirstMessageSubject: function () {
		return 'Confirmation of Thalys booking : BRUXELLES MIDI -> PARIS 26/02/2020 16:58'
	}
};

GmailAppMock = {
	getInboxThreads: function() {
		return [
			threadRotterdam, threadAmsterdam, threadParis
		]
	}
};

createCalendarItemMock = function(thalysJourney) {
	return 'created';
};

app.__set__('GmailApp', GmailAppMock);
app.__set__('createCalendarItem', createCalendarItemMock);


describe('Acceptance', function() {
	it('Should create Calendar items', function() {
		assert.deepStrictEqual(init(), ['created', 'created', 'created']);
	});
});

describe('Thalys information from mail', function() {
	it('Should find Thalys mails', function() {
		assert.equal(isThalysEmail(threadRotterdam), true)
	});

	it('Should get the traject from the subject line', function() {
		assert.equal(getTrajactFromThalysEmail(threadRotterdam), 'ROTTERDAM CENTRAAL -> BRUXELLES MIDI 26/02/2020 16:58')
	});

	it('Should get the datetime from the subject line', function() {
		assert.deepStrictEqual(getDepartureDatetimeFromThalysEmail(threadRotterdam), new Date("02/26/2020 16:58:00:000"));
	});

	it('Should get the travel time for Rotterdam', function() {
		assert.deepStrictEqual(getTravelTimeFromThalysEmail(threadRotterdam), 70);
	});

	it('Should get the travel time for Amsterdam', function() {
		assert.deepStrictEqual(getTravelTimeFromThalysEmail(threadAmsterdam), 120);
	});

	it('Should get the travel time for default: 1h', function() {
		assert.deepStrictEqual(getTravelTimeFromThalysEmail(threadParis), 60);
	});

	it('Should create a clean object with travel information', function() {
		assert.deepStrictEqual(createThalysJourney(threadRotterdam), {
			'traject': 'ROTTERDAM CENTRAAL -> BRUXELLES MIDI 26/02/2020 16:58',
			'start': new Date("02/26/2020 16:58:00:000"),
			'end': new Date("02/26/2020 18:08:00:000")
		});
	});
});
