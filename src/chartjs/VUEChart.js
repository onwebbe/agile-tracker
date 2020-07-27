/*
  author: onwebbe (tai)
*/
/* global $:true */
import EventProvider from './EventProvider.js';

function VUEChart (element, width, height, maxX, settings) {
  this.settings = settings;
  this.groups = {};
  this.points = [];
  this.groupVisible = {};
  this.currentActivePoint = null;
  this.createInitialDom(element);
  this.init(width, height, maxX);
};
VUEChart.prototype = new EventProvider();
VUEChart.prototype.getGroupsData = function () {
  return this.groups;
};
VUEChart.prototype.createInitialDom = function (element) {
  var domStr = '<div class="chartMain" style="display:inline-block">' +
                '  <div class="chartTitle" style="font-size: 25px;text-align:center;margin-bottom:15px;">' +
                '    Chart Title' +
                '  </div>' +
                '  <div style="display:inline-flex;">' +
                '    <div class="axisYText" style="display:inline-block;min-width:30px;position:relative;">' +
                '    </div>' +
                '    <div>' +
                '      <div class="chart" style="position: relative;display:inline-block;">' +
                '        <div class="axisArea" style="position:absolute;left:0px;top:0px;">' +
                '          <div class="axisX" style="position: absolute;border-top:1px solid black;">' +
                '          </div>' +
                '          <div class="axisY" style="position: absolute;border-left:1px solid black;">' +
                '          </div>' +
                '        </div>' +
                '        <div class="chartArea" style="position:absolute;">' +
                '        </div>' +
                '      </div>' +
                '      <div class="axisXText" style="position:relative;min-height:40px;"></div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="chartBar" style="display: flex;justify-content:space-evenly;">' +
                '  </div>' +
                '</div>';
  this.ele = $(domStr);
  $(element).append(this.ele);
};
VUEChart.colors = {};
VUEChart.colors['lightblue'] = 'rgba(84, 158, 248, 0.9)';
VUEChart.colors['lightgreen'] = 'rgba(124, 191, 80, 0.9)';
VUEChart.colors['lightred'] = '#d18080';
VUEChart.colors['lightpurple'] = '#af7db0';
VUEChart.prototype.init = function (width, height, maxX) {
  var self = this;
  this.fireEvent('beforeChartInitial');

  $(this.ele).find('.axisYText').empty();
  $(this.ele).find('.axisX').empty();
  $(this.ele).find('.axisY').empty();
  $(this.ele).find('.chartArea').empty();
  $(this.ele).find('.axisXText').empty();
  $(this.ele).find('.chartTitle').empty();
  $(this.ele).find('.chartBar').empty();

  this.addPopoverContainer();

  this.chartHeight = height;
  this.chartWidth = width;

  this.axisLength = 5;  // the dash width for axis Y and dash height for axis X
  this.axisTextHeight = 15; // the text size

  this.axisXGapCount = 10; // count of the axis X gap to display
  this.axisYGapCount = 10; // count of the axis Y gap to display

  this.minXGap = 25;  // the min pixel for x
  this.minYGap = 30;  // the min pixel for y

  this.maxXValue = 10;
  if (maxX && maxX > 1) {
    this.maxXValue = maxX;
  }
  this.maxYValue = 20;

  this.chartAreaWidth = this.chartWidth;
  this.chartAreaHeight = this.chartHeight;
  this.axisAreaWidth = this.chartWidth + this.axisLength;
  this.axisAreaHeight = this.chartHeight + this.axisLength;

  this.chartHeight = this.axisAreaHeight;
  this.chartWidth = this.axisAreaWidth;

  this.axis = {
    x: [],
    y: []
  };
  this.eachNumberXGap = this.chartAreaWidth / this.maxXValue * 0.9; // number 1 means how much pixel for X
  this.eachNumberYGap = this.chartAreaHeight / this.maxYValue * 0.9; // number 1 means how much pixel for Y
  // console.log(this.eachNumberXGap + ':' + this.eachNumberYGap);

  this.numberUnderEachXGap = Math.ceil(this.minXGap / this.eachNumberXGap);
  this.numberUnderEachYGap = Math.ceil(this.minYGap / this.eachNumberYGap);

  // console.log('Number of gap:' + this.numberUnderEachXGap + ':' + this.numberUnderEachYGap);
  this.axisXGap = this.numberUnderEachXGap * this.eachNumberXGap;
  this.axisYGap = this.numberUnderEachYGap * this.eachNumberYGap;

  this.axisXGapCount = Math.ceil(this.chartAreaWidth / this.axisXGap);
  this.axisYGapCount = Math.ceil(this.chartAreaHeight / this.axisYGap);

  this.pointHeight = 10;
  this.pointWidth = 10;
  this.pointColor = 'red';
  this.lineHeight = 2;
  if (this.settings && this.settings.pointHeight) {
    this.pointHeight = this.settings.pointHeight;
  }
  if (this.settings && this.settings.pointWidth) {
    this.pointWidth = this.settings.pointWidth;
  }
  if (this.settings && this.settings.pointColor) {
    this.pointColor = this.settings.pointColor;
  }
  if (this.settings && this.settings.lineHeight) {
    this.lineHeight = this.settings.lineHeight;
  }

  $(this.ele).find('.chart').width(this.axisAreaWidth).height(this.axisAreaHeight);
  $(this.ele).find('.chart .chartArea').width(this.chartAreaWidth).height(this.chartAreaHeight).css('left', this.axisLength + 'px').css('top', '0px');
  $(this.ele).find('.axisYText').height(this.chartAreaHeight);
  $(this.ele).find('.axisXText').width(this.chartAreawidth);

  /* this.groups = {
    'groupid': {
      groupid: 'groupid',
      groupname: 'groupname',
      color: 'red',
      points: [],
      lines: [],
      visible: true
    }
  } */
  this.fireEvent('beforeChartAxisInitial');
  this.addAxisX();
  this.addAxisY();
  this.fireEvent('afterChartAxisInitial');
  this.fireEvent('beforeChartAxisGapInitial');
  this.updateAxisX();
  this.updateAxisY();
  this.fireEvent('afterChartAxisInitial');
  this.renderBar();
  this.fireEvent('afterChartInitial');

  // this.groups
  $(this.ele).find('.chart').click(function () {
    self.clearAllClickedPoint();
    self.fireEvent('chartClicked', {ele: this, data: this.pointdata});
  });
};
VUEChart.prototype.destory = function () {
  $(this.ele).empty();
};
VUEChart.prototype.emptyData = function () {
  $(this.ele).find('.chart .chartArea').empty();
  this.groups = {};
  this.points = [];
};
VUEChart.prototype.clearAllPoint = function () {
  $(this.ele).find('.chart .chartArea').empty();
};
VUEChart.prototype.addPopoverContainer = function () {
  if ($(this.ele).find('.chart .chartArea .popoverContainer').length === 0) {
    var popupContainer = $('<div class="popoverContainer" style="position:absolute;display:none;"><div class="popoverContent">test1818181818</div><div class="calloutpoint"></div></div>');
    $(this.ele).find('.chart .chartArea').append(popupContainer);
  }
};
VUEChart.prototype.displayPopover = function (x, y, htmlContent) {
  $(this.ele).find('.chartArea .popoverContainer .popoverContent').empty();
  $(this.ele).find('.chartArea .popoverContainer').fadeIn();
  var contentHTMLEle = $(htmlContent);
  $(this.ele).find('.chartArea .popoverContainer .popoverContent').append(contentHTMLEle);
  var width = $(this.ele).find('.chartArea .popoverContainer').width();
  var height = $(this.ele).find('.chartArea .popoverContainer').height();

  var left = x - (width / 2 + 10 + 6);
  var top = y - (height + 35);
  $(this.ele).find('.chartArea .popoverContainer').css('left', left + 'px').css('top', top + 'px');
};
VUEChart.prototype.hidePopover = function () {
  $(this.ele).find('.chartArea .popoverContainer').hide();
};
VUEChart.prototype.clearAllClickedPoint = function () {
  if (!this.groups) {
    return;
  }
  this.currentActivePoint = null;
  for (var groupid in this.groups) {
    var groupItem = this.groups[groupid];
    var points = groupItem.points;
    for (var i = 0; i < points.length; i++) {
      var pointItem = points[i];
      var pointEle = pointItem.ele;
      $(pointEle).removeClass('pointHighlited');
    }
  }
};

VUEChart.prototype.updateAxisX = function () {
  this.fireEvent('beforeUpdateAxisX');
  this.removeAxisXGap();
  this.eachNumberXGap = this.chartAreaWidth / this.maxXValue * 0.9; // number 1 means how much pixel for X

  this.numberUnderEachXGap = Math.ceil(this.minXGap / this.eachNumberXGap);

  // console.log('Number of gap:x:' + this.numberUnderEachXGap);
  this.axisXGap = this.numberUnderEachXGap * this.eachNumberXGap;

  this.axisXGapCount = Math.ceil(this.chartAreaWidth / this.axisXGap);
  // console.log('X----Count:' + this.axisXGapCount + ': gap:' + this.axisXGap);
  this.addAxisXGap();
  this.fireEvent('afterUpdateAxisX');
};
VUEChart.prototype.updateAxisY = function () {
  this.fireEvent('beforeUpdateAxisY');
  this.removeAxisYGap();
  this.eachNumberYGap = this.chartAreaHeight / this.maxYValue * 0.9; // number 1 means how much pixel for Y
  // console.log(this.eachNumberXGap + ':' + this.eachNumberYGap);

  this.numberUnderEachYGap = Math.ceil(this.minYGap / this.eachNumberYGap);

  // console.log('Number of gap:y:' + this.numberUnderEachYGap);
  this.axisYGap = this.numberUnderEachYGap * this.eachNumberYGap;

  this.axisYGapCount = Math.ceil(this.chartAreaHeight / this.axisYGap);
  // console.log('Y----Count:' + this.axisYGapCount + ': gap:' + this.axisYGap);
  this.addAxisYGap();
  this.fireEvent('afterUpdateAxisY');
};
VUEChart.prototype.addAxisX = function () {
  var axisXWidth = this.chartAreaWidth;
  var axisXLeft = this.axisLength;

  var axisXTop = this.chartAreaHeight;
  var axisX = $(this.ele).find('.chart .axisArea .axisX');
  axisX.width(axisXWidth);
  axisX.css('left', axisXLeft + 'px');
  axisX.css('top', axisXTop + 'px');
};
VUEChart.prototype.removeAxisXGap = function () {
  $(this.ele).find('.axisX').empty();
  $(this.ele).find('.axisXText').empty();
};
VUEChart.prototype.addAxisXGap = function () {
  var startPosition = 0;
  var i = 1;
  while ((startPosition + (i * this.axisXGap)) < this.chartAreaWidth) {
    var positionLeft = startPosition + this.axisXGap * i;
    var gapItem = $('<div></div>').addClass('chartAxis').css('border-left', '1px solid black').height(this.axisLength).css('left', positionLeft + 'px');
    $(this.ele).find('.chart .axisArea .axisX').append(gapItem);

    // add axis text
    var textItem = $('<div></div>').text(this.numberUnderEachXGap * i).addClass('chartAxisText');
    $(this.ele).find('.axisXText').append(textItem);
    var textPositionLeft = positionLeft;
    textItem.css('left', textPositionLeft + 'px');
    i++;
  }
};

VUEChart.prototype.addAxisY = function () {
  var axisYHeight = this.chartAreaHeight;
  var axisYLeft = this.axisLength;

  var axisY = $(this.ele).find('.chart .axisArea .axisY');
  axisY.height(axisYHeight);
  axisY.css('left', axisYLeft + 'px');
  axisY.css('top', '0px');
};
VUEChart.prototype.addAxisYGap = function () {
  var i = 0;
  var yPixel = i * this.axisYGap;
  var positionTop = this.chartAreaHeight - yPixel;
  i++;
  while (positionTop >= 0) {
    yPixel = i * this.axisYGap;
    positionTop = this.chartAreaHeight - yPixel;
    if (positionTop <= 0) {
      break;
    }
    var gapItem = $('<div></div>').addClass('chartAxis').css('border-top', '1px solid black').width(this.axisLength).css('top', positionTop + 'px').css('left', '-' + this.axisLength + 'px');
    $(this.ele).find('.chart .axisArea .axisY').append(gapItem);

    // add axis text
    var axisYTestWidth = $(this.ele).find('.axisYText').width();
    var textItem = $('<div></div>').text(this.numberUnderEachYGap * i).addClass('chartAxisText').width(axisYTestWidth - 5).css('textAlign', 'right');
    $(this.ele).find('.axisYText').append(textItem);
    var height = textItem.height();
    var textPositionTop = positionTop - height / 2;
    textItem.css('top', textPositionTop + 'px');

    i++;
  }
};
VUEChart.prototype.removeAxisYGap = function () {
  $(this.ele).find('.axisY').empty();
  $(this.ele).find('.axisYText').empty();
};
VUEChart.prototype.addGroup = function (groupid, settings) {
  this.fireEvent('beforeAddGroup', {groupid: groupid, groupsettings: settings});
  var group = null;
  if (this.groups[groupid] == null) {
    group = {};
    this.groups[groupid] = group;
  } else {
    group = this.groups[groupid];
  }

  $.extend(group, settings);

  if (group.points == null) {
    group.points = [];
  }
  if (group.lines == null) {
    group.lines = [];
  }
  this.fireEvent('afterAddGroup', {groupid: groupid, groupsettings: settings});
};
VUEChart.prototype.reAddAllPoint = function () {
  $(this.ele).find('.chart .chartArea').empty();
  this.addPopoverContainer();
  for (var group in this.groups) {
    var groupItem = this.groups[group];
    var points = groupItem.points;
    var newPoints = [];
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      var pointExtraData = point.extraData;
      var x = point.x;
      var y = point.y;
      var changedPoint = this.addPoint(x, y, group, pointExtraData, false);
      newPoints.push(changedPoint);
    }
    groupItem.points = newPoints;
  }
};
VUEChart.prototype.addPoint = function (x, y, groupid, extradata, isAdd) {
  var self = this;
  this.fireEvent('beforeAddPoint', {x: x, y: y, groupid: groupid, isAdd: isAdd, pointdata: extradata});
  if (isAdd == null) {
    isAdd = true;
  }

  var group = this.groups[groupid];
  var points = group && group.points;
  if (points == null) {
    return;
  }

  /* var isRescale = false;
  if (x > this.maxXValue) {
    this.maxXValue = x;
    this.updateAxisX();
    isRescale = true;
  }
  if (y > this.maxYValue) {
    this.maxYValue = y;
    this.updateAxisY();
    isRescale = true;
  }

  if (isRescale) {
    console.log('group:' + groupid + ' rescale');
    this.reAddAllPoint();
    this.reAddAllGroupLine();
  } */

  points = group.points;
  var xPixel = x * this.eachNumberXGap;
  var yPixel = y * this.eachNumberYGap;
  var positionX = xPixel - this.pointWidth / 2;
  var positionY = this.chartAreaHeight - yPixel - this.pointHeight / 2;

  var color = group.color;
  let pointsLength = points.length;
  var point = {
    idx: pointsLength,
    x: x,
    y: y,
    positionX: xPixel,
    positionY: this.chartAreaHeight - yPixel,
    groupid: groupid
  };
  if (isAdd) {
    points.push(point);
  }

  var pointItem = $('<div></div>').attr('pointid', 'point_id_' + point.x + '-' + point.y).attr('groupid', groupid).attr('type', 'point').addClass('chartPoint').height(this.pointHeight).width(this.pointWidth).css('color', color).css('backgroundColor', color).css('top', positionY + 'px').css('left', positionX + 'px').css('border-radius', this.pointWidth / 2 + 'px');
  if (extradata && extradata.cssstyle) {
    pointItem.css(extradata.cssstyle);
  }

  pointItem.click(function (evt) {
    var isClicked = $(this).hasClass('pointHighlited');
    self.fireEvent('pointclicked', {ele: this, data: this.pointdata, isClicked: !isClicked});
    if (isClicked) {
      $(this).removeClass('pointHighlited');
      self.currentActivePoint = null;
    } else {
      $(this).addClass('pointHighlited');
      self.currentActivePoint = this.pointdata;
    }
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  })
  .hover(function (evt) {
    self.fireEvent('pointhoverenter', {ele: pointItem, point: point, x: x, y: y, groupid: groupid, isAdd: isAdd, pointdata: extradata});
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  }, function (evt) {
    self.fireEvent('pointhoverleave', {ele: pointItem, point: point, x: x, y: y, groupid: groupid, isAdd: isAdd, pointdata: extradata});
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  });
  point['ele'] = pointItem;
  $(this.ele).find('.chart .chartArea').append(pointItem);
  var extraDataObj = {
    extraData: extradata
  };
  $.extend(point, extraDataObj);
  pointItem[0].pointdata = point;
  this.fireEvent('afterAddPoint', {ele: pointItem, point: point, x: x, y: y, groupid: groupid, isAdd: isAdd, pointdata: extradata});
  return point;
};
VUEChart.prototype.addLine = function (point1, point2, extradata, isAdd) {
  var self = this;
  this.fireEvent('beforeAddLine', {point1: point1, point2: point2, isAdd: isAdd, linedata: extradata});
  if (isAdd == null) {
    isAdd = true;
  }
  var groupid = point1.groupid;
  var group = this.groups[groupid];
  var color = group.color;
  var point2Ele = point2.ele;
  var point2EleId = point2Ele.attr('pointid');
  var lineItem = $('<div style="height:' + this.lineHeight + 'px;background-color:' + color + ';color:' + color + ';transform-origin:0% 0%;"></div>').attr('lineid', 'line_id_' + point2EleId).attr('groupid', groupid).attr('type', 'line').addClass('chartLines');
  var point1X = point1.positionX + this.lineHeight / 2;
  var point1Y = point1.positionY - this.lineHeight / 2;
  var point2X = point2.positionX + this.lineHeight / 2;
  var point2Y = point2.positionY - this.lineHeight / 2;
  var a = point2Y - point1Y;
  var b = point2X - point1X;
  var width = Math.sqrt(a * a + b * b);
  var angle = Math.atan(Math.abs(a) / Math.abs(b));
  var angleTh = (180 / Math.PI) * angle;
  if (a < 0) {
    angleTh = -angleTh;
  }
  lineItem.width(width).css('left', point1X + 'px').css('top', point1Y + 'px').css('transform', 'rotate(' + angleTh + 'deg)')
  .click(function (evt) {
    self.fireEvent('lineclicked', {ele: this, data: this.linedata});
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  })
  .hover(function (evt) {
    $(this).addClass('lineHighlited');
    self.fireEvent('linehoverenter', {ele: this, data: this.pointdata});
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  }, function (evt) {
    $(this).removeClass('lineHighlited');
    self.fireEvent('linehoverleave', {ele: this, data: this.pointdata});
    evt.stopPropagation();
    evt.stopImmediatePropagation();
  });
  var line = {
    startPoint: point1,
    endPoint: point2,
    groupid: groupid,
    ele: lineItem
  };
  lineItem[0].linedata = line;
  if (isAdd) {
    group.lines.push(line);
  }
  $(this.ele).find('.chart .chartArea').append(lineItem);
  $.extend(line, extradata);
  this.fireEvent('afterAddLine', {ele: lineItem, line: line, point1: point1, point2: point2, isAdd: isAdd, linedata: extradata});
  return line;
};
VUEChart.prototype.reAddAllGroupLine = function (isAdd) {
  $(this.ele).find('.chart .chartArea [type="line"]').remove();
  for (var group in this.groups) {
    this.addAllLine(group, isAdd);
  }
};
VUEChart.prototype.addAllLine = function (groupid, isAdd) {
  if (this.groups[groupid] == null) {
    return;
  }
  if (isAdd == null) {
    isAdd = true;
  }

  var group = this.groups[groupid];
  var points = group.points;
  group.lines = [];

  var sortedPoints = points.sort(function (a, b) {
    if (a.x < b.x) {
      return -1;
    } else if (a.x === b.x) {
      return 0;
    } else {
      return 1;
    }
  });
  var point1 = sortedPoints[0];
  var point2 = null;

  var returnLines = [];
  for (var i = 1; i < sortedPoints.length; i++) {
    point2 = sortedPoints[i];
    returnLines.push(this.addLine(point1, point2, null, isAdd));
    point1 = point2;
  }
  return returnLines;
};
VUEChart.prototype.setVisible = function (groupid, visible, type) {
  var queryStr = '.chartArea [groupid="' + groupid + '"]';
  if (type != null) {
    queryStr = queryStr + '[type="' + type + '"';
  }
  if (visible === true) {
    $(this.ele).find(queryStr).show();
  } else {
    $(this.ele).find(queryStr).hide();
  }
};
VUEChart.prototype.renderBar = function () {
  var self = this;
  $(this.ele).find('.chartBar').empty();
  for (var groupid in this.groups) {
    if (this.groupVisible[groupid] === undefined) {
      this.groupVisible[groupid] = true;
    }
    var groupItem = this.groups[groupid];
    var groupColor = groupItem.color;
    var groupEle = $('<div class="chartBarItem"><div class="colorspan" style="display:inline-block;"></div><span class="textspan"></span></div>');
    groupEle.attr('groupid', groupid);
    groupEle.attr('groupcolor', groupColor);
    groupEle.find('.colorspan').width(10).height(10).css('border', '1px solid black').css('backgroundColor', groupColor);
    groupEle.find('.textspan').text('   ' + groupid);
    $(this.ele).find('.chartBar').append(groupEle);
    groupEle.click(function () {
      var theGroupId = $(this).attr('groupid');
      $(this).toggleClass('disabled');
      if ($(this).hasClass('disabled')) {
        self.setVisible(theGroupId, false);
        self.groupVisible[theGroupId] = false;
      } else {
        self.setVisible(theGroupId, true);
        self.groupVisible[theGroupId] = true;
      }
    });
    $(groupEle).removeClass('disabled');
    if (this.groupVisible[groupid] === false) {
      groupEle.addClass('disabled');
      this.setVisible(groupid, false);
    }
  }
};
VUEChart.prototype.reRenderGroupVisible = function () {
  // console.log(this.groupVisible);
  for (let groupid in this.groupVisible) {
    var visibleStatus = this.groupVisible[groupid];
    // console.log(groupid + ':' + visibleStatus);
    this.setVisible(groupid, visibleStatus);
  }
};
VUEChart.prototype.reActivePoint = function () {
  var currentPoint = this.currentActivePoint;
  if (currentPoint == null) {
    this.ele.find('.chart .chartArea [type="point"]').removeClass('pointHighlited');
    return;
  }
  var groupid = currentPoint.groupid;
  var x = currentPoint.x;
  var y = currentPoint.y;
  $('[pointid="point_id_' + x + '-' + y + '"][groupid="' + groupid + '"]').click();
};
VUEChart.prototype.getMaxXY = function () {
  var maxX = 0;
  var maxY = 0;
  for (var groupid in this.groups) {
    var points = this.groups[groupid].points;
    for (var i = 0; i < points.length; i++) {
      var x = points[i].x;
      var y = points[i].y;
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
  }
  return {maxx: maxX, maxy: maxY};
};
VUEChart.prototype.reScaleChart = function () {
  var maxXY = this.getMaxXY();
  var maxX = maxXY.maxx;
  var maxY = maxXY.maxy;
  var isRescale = false;
  // console.log('maxx:' + maxX + ':maxy:' + maxY);
  if (maxX > this.maxXValue) {
    this.maxXValue = maxX;
    this.updateAxisX();
    isRescale = true;
  }
  if (maxY > this.maxYValue) {
    this.maxYValue = maxY;
    this.updateAxisY();
    isRescale = true;
  }

  if (isRescale) {
    // console.log('group:' + groupid + ' rescale');
    this.reAddAllPoint();
    this.reAddAllGroupLine();
  }
};
/*
<script>
var chart = new VUEChart('.chart1', 1000,500);

//chart.init(500,300);

chart.addGroup('devgroup', {color: 'green'})
var p1 = chart.addPoint(1, 5, 'devgroup');
var p2 = chart.addPoint(2, 7, 'devgroup');
var p3 = chart.addPoint(3, 2, 'devgroup');
var p4 = chart.addPoint(4, 2, 'devgroup');
var p4 = chart.addPoint(5, 10, 'devgroup');
//chart.addAllLine('devgroup');
chart.addGroup('qagroup', {color: 'red'});
var p1 = chart.addPoint(1, 40, 'qagroup');
var p2 = chart.addPoint(2, 30, 'qagroup');
var p3 = chart.addPoint(3, 30, 'qagroup');
var p4 = chart.addPoint(4, 35, 'qagroup');
//chart.addAllLine('qagroup');
chart.renderBar();
chart.reScaleChart();
chart.addEventListener('pointclicked', function(evt){
  console.log('pointclicked');
  console.log(evt);
});
chart.addEventListener('lineclicked', function(evt){
  console.log('lineclicked');
  console.log(evt);
});
*/
export default VUEChart;
