/*
  author: onwebbe (tai)
*/
function EventProvider () {
};
EventProvider.prototype.addEventListener = function (eventname, fun) {
  if (this.eventbus == null) {
    this.eventbus = [];
  }
  if (this.eventbus[eventname] == null) {
    this.eventbus[eventname] = {};
  }
  var eventid = eventname + '_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000000000000);
  this.eventbus[eventname][eventid] = fun;
  // console.log('added event:' + eventid);
  return eventid;
};
EventProvider.prototype.fireEvent = function (eventname, evtdata) {
  if (this.eventbus == null || this.eventbus[eventname] == null) {
    return;
  }
  for (var eventid in this.eventbus[eventname]) {
    var eventFun = this.eventbus[eventname][eventid];
    var eventObj = {
      source: this,
      sourceele: evtdata ? evtdata.ele : null,
      eventname: eventname,
      eventid: eventid,
      data: evtdata
    };
    eventFun(eventObj);
  }
};

export default EventProvider;
