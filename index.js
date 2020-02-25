function init() {
	let threads = getNewEmails();
	let thalysBookingConfirmationThreads = [];

	thalysBookingConfirmationThreads = threads.filter(isThalysEmail);
	let thalysJourneys = thalysBookingConfirmationThreads.map(createThalysJourney);
	var calendarItems = thalysJourneys.map(createCalendarItem);

	console.log(calendarItems);
	return calendarItems;
}

function createCalendarItem(thalysJourney) {
	return CalendarApp.getDefaultCalendar().createEvent(thalysJourney.traject, thalysJourney.start, thalysJourney.end);
}

function createThalysJourney(thread) {
	var end = getDepartureDatetimeFromThalysEmail(thread);
	end.setMinutes(getDepartureDatetimeFromThalysEmail(thread).getMinutes() + getTravelTimeFromThalysEmail(thread));

	return {
		"traject": getTrajactFromThalysEmail(thread),
		"start": getDepartureDatetimeFromThalysEmail(thread),
		"end": end
	}
}

function getTrajactFromThalysEmail(thread) {
	return thread.getFirstMessageSubject().split(' : ')[1];
}

function getTravelTimeFromThalysEmail(thread) {
	const subject = thread.getFirstMessageSubject();
	if (subject.indexOf('ROTTERDAM') > -1) {
		return 70;
	} else if (subject.indexOf('AMSTERDAM') > -1) {
		return 120;
	} else {
		return 60;
	}
}

function getDepartureDatetimeFromThalysEmail(thread) {
	let date = thread.getFirstMessageSubject().match(/([0-9]{2})\/([0-9]{2})\/([0-9]{4})/);
	let time = thread.getFirstMessageSubject().match(/([0-9]{2}):([0-9]{2})/);

	let datetime = new Date(
		parseInt(date[3], 10),
		parseInt(date[2], 10) - 1,
		parseInt(date[1], 10),
		parseInt(time[1], 10),
		parseInt(time[2], 10),
		0,
		0
	);
	return datetime;
}

function getNewEmails() {
	return GmailApp.getInboxThreads(0, 50);
}

function isThalysEmail(thread) {
	return thread.getFirstMessageSubject().indexOf('Thalys b') > -1;
}

