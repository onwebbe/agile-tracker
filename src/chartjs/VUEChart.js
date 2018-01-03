/*
  author: onwebbe (tai)
*/
/* global $:true */
import EventProvider from './EventProvider.js'
function VUEChart (element, width, height) {
  this.groups = {};
  this.points = [];
  this.createInitialDom(element);
  this.init(width, height);
};
VUEChart.prototype = new EventProvider();
VUEChart.prototype.createInitialDom = function (element) {
  var domStr = '<div class="chartMain" style="display:inline-block">' +
                '  <div class="chartTitle" style="font-size: 25px;text-align:center;margin-bottom:15px;">' +
                '    Chart Title' +
                '  </div>' +
                '  <div style="display:inline-flex;">' +
                '    <div class="axisYText" style="display:inline-block;min-width:50px;position:relative;">' +
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
}
VUEChart.colors = {};
VUEChart.colors['lightblue'] = '#3f6688';
VUEChart.colors['lightorange'] = '#b29666';
VUEChart.colors['lightred'] = '#d18080';
VUEChart.colors['lightgreen'] = '#92b479';
VUEChart.colors['lightpurple'] = '#af7db0';
VUEChart.prototype.init = function (width, height) {
  this.fireEvent('beforeChartInitial');

  $(this.ele).find('.axisYText').empty();
  $(this.ele).find('.axisX').empty();
  $(this.ele).find('.axisY').empty();
  $(this.ele).find('.chartArea').empty();
  $(this.ele).find('.axisXText').empty();
  $(this.ele).find('.chartTitle').empty();
  $(this.ele).find('.chartBar').empty();

  this.chartHeight = height;
  this.chartWidth = width;

  this.axisLength = 5;  // the dash width for axis Y and dash height for axis X
  this.axisTextHeight = 15; // the text size

  this.axisXGapCount = 10; // count of the axis X gap to display
  this.axisYGapCount = 10; // count of the axis Y gap to display

  this.minXGap = 50;  // the min pixel for x
  this.minYGap = 30;  // the min pixel for y

  this.maxXValue = 10;
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

  console.log('Number of gap:' + this.numberUnderEachXGap + ':' + this.numberUnderEachYGap);
  this.axisXGap = this.numberUnderEachXGap * this.eachNumberXGap;
  this.axisYGap = this.numberUnderEachYGap * this.eachNumberYGap;

  this.axisXGapCount = Math.ceil(this.chartAreaWidth / this.axisXGap);
  this.axisYGapCount = Math.ceil(this.chartAreaHeight / this.axisYGap);

  this.pointHeight = 10;
  this.pointWidth = 10;
  this.pointColor = 'red';

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
}

VUEChart.prototype.updateAxisX = function () {
  this.fireEvent('beforeUpdateAxisX');
  this.removeAxisXGap();
  this.eachNumberXGap = this.chartAreaWidth / this.maxXValue * 0.9; // number 1 means how much pixel for X

  this.numberUnderEachXGap = Math.ceil(this.minXGap / this.eachNumberXGap);

  console.log('Number of gap:x:' + this.numberUnderEachXGap);
  this.axisXGap = this.numberUnderEachXGap * this.eachNumberXGap;

  this.axisXGapCount = Math.ceil(this.chartAreaWidth / this.axisXGap);
  console.log('X----Count:' + this.axisXGapCount + ': gap:' + this.axisXGap);
  this.addAxisXGap();
  this.fireEvent('afterUpdateAxisX');
}
VUEChart.prototype.updateAxisY = function () {
  this.fireEvent('beforeUpdateAxisY');
  this.removeAxisYGap();
  this.eachNumberYGap = this.chartAreaHeight / this.maxYValue * 0.9; // number 1 means how much pixel for Y
  // console.log(this.eachNumberXGap + ':' + this.eachNumberYGap);

  this.numberUnderEachYGap = Math.ceil(this.minYGap / this.eachNumberYGap);

  console.log('Number of gap:y:' + this.numberUnderEachYGap);
  this.axisYGap = this.numberUnderEachYGap * this.eachNumberYGap;

  this.axisYGapCount = Math.ceil(this.chartAreaHeight / this.axisYGap);
  console.log('Y----Count:' + this.axisYGapCount + ': gap:' + this.axisYGap);
  this.addAxisYGap();
  this.fireEvent('afterUpdateAxisY');
}
VUEChart.prototype.addAxisX = function () {
  var axisXWidth = this.chartAreaWidth;
  var axisXLeft = this.axisLength;

  var axisXTop = this.chartAreaHeight;
  var axisX = $(this.ele).find('.chart .axisArea .axisX');
  axisX.width(axisXWidth);
  axisX.css('left', axisXLeft + 'px');
  axisX.css('top', axisXTop + 'px');
}
VUEChart.prototype.removeAxisXGap = function () {
  $(this.ele).find('.axisX').empty();
  $(this.ele).find('.axisXText').empty();
}
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
}

VUEChart.prototype.addAxisY = function () {
  var axisYHeight = this.chartAreaHeight;
  var axisYLeft = this.axisLength;

  var axisY = $(this.ele).find('.chart .axisArea .axisY');
  axisY.height(axisYHeight);
  axisY.css('left', axisYLeft + 'px');
  axisY.css('top', '0px');
}
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
    var textItem = $('<div></div>').text(this.numberUnderEachYGap * i).addClass('chartAxisText').width(45).css('textAlign', 'right');
    $(this.ele).find('.axisYText').append(textItem);
    var height = textItem.height();
    var textPositionTop = positionTop - height / 2;
    textItem.css('top', textPositionTop + 'px');

    i++;
  }
}
VUEChart.prototype.removeAxisYGap = function () {
  $(this.ele).find('.axisY').empty();
  $(this.ele).find('.axisYText').empty();
}
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
}
VUEChart.prototype.reAddAllPoint = function () {
  $(this.ele).find('.chart .chartArea').empty();
  for (var group in this.groups) {
    var groupItem = this.groups[group];
    var points = groupItem.points;
    var newPoints = [];
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      var x = point.x;
      var y = point.y;
      var changedPoint = this.addPoint(x, y, group, null, false);
      newPoints.push(changedPoint);
    }
    console.log(group);
    console.log(newPoints);
    groupItem.points = newPoints;
  }
}
VUEChart.prototype.addPoint = function (x, y, groupid, extradata, isAdd) {
  var self = this;
  this.fireEvent('beforeAddPoint', {x: x, y: y, groupid: groupid, isAdd: isAdd, pointdata: extradata});
  if (isAdd == null) {
    isAdd = true;
  }

  var group = this.groups[groupid];
  var points = group.points;
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
  var point = {
    idx: points.length,
    x: x,
    y: y,
    positionX: xPixel,
    positionY: this.chartAreaHeight - yPixel,
    groupid: groupid
  }
  if (isAdd) {
    points.push(point);
  }
  var pointItem = $('<div></div>').attr('groupid', groupid).attr('type', 'point').addClass('chartPoint').height(this.pointHeight).width(this.pointWidth).css('backgroundColor', color).css('top', positionY + 'px').css('left', positionX + 'px').css('border-radius', this.pointWidth / 2 + 'px');

  pointItem.click(function () {
    self.fireEvent('pointclicked', {ele: this, data: this.pointdata});
  })
  .hover(function () {
    self.fireEvent('pointhoverenter', {ele: this, data: this.pointdata});
  }, function () {
    self.fireEvent('pointhoverleave', {ele: this, data: this.pointdata});
  });
  point['ele'] = pointItem;
  pointItem[0].pointdata = point;
  $(this.ele).find('.chart .chartArea').append(pointItem);

  $.extend(point, extradata);
  this.fireEvent('afterAddPoint', {ele: pointItem, point: point, x: x, y: y, groupid: groupid, isAdd: isAdd, pointdata: extradata});
  return point;
}
VUEChart.prototype.addLine = function (point1, point2, extradata, isAdd) {
  var self = this;
  this.fireEvent('beforeAddLine', {point1: point1, point2: point2, isAdd: isAdd, linedata: extradata});
  if (isAdd == null) {
    isAdd = true;
  }
  var groupid = point1.groupid;
  var group = this.groups[groupid];
  var color = group.color;
  var lineItem = $('<div style="border-top:1px solid ' + color + ';transform-origin:0% 0%;"></div>').attr('groupid', groupid).attr('type', 'line').addClass('chartLines');
  var point1X = point1.positionX;
  var point1Y = point1.positionY;
  var point2X = point2.positionX;
  var point2Y = point2.positionY;
  var a = point2Y - point1Y;
  var b = point2X - point1X;
  var width = Math.sqrt(a * a + b * b);
  var angle = Math.atan(Math.abs(a) / Math.abs(b));
  var angleTh = (180 / Math.PI) * angle;
  if (a < 0) {
    angleTh = -angleTh;
  }
  lineItem.width(width).css('left', point1X + 'px').css('top', point1Y + 'px').css('transform', 'rotate(' + angleTh + 'deg)')
  .click(function () {
    self.fireEvent('lineclicked', {ele: this, data: this.linedata});
  })
  .hover(function () {
    $(this).css('border-top-width', '2px');
    self.fireEvent('linehoverenter', {ele: this, data: this.pointdata});
  }, function () {
    $(this).css('border-top-width', '1px');
    self.fireEvent('linehoverleave', {ele: this, data: this.pointdata});
  });
  var line = {
    startPoint: point1,
    endPoint: point2,
    groupid: groupid,
    ele: lineItem
  }
  lineItem[0].linedata = line;
  if (isAdd) {
    group.lines.push(line);
  }
  $(this.ele).find('.chart .chartArea').append(lineItem);
  $.extend(line, extradata);
  this.fireEvent('afterAddLine', {ele: lineItem, line: line, point1: point1, point2: point2, isAdd: isAdd, linedata: extradata});
  return line;
}
VUEChart.prototype.reAddAllGroupLine = function (isAdd) {
  for (var group in this.groups) {
    this.addAllLine(group, isAdd);
  }
}
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
  for (var i = 1; i < sortedPoints.length; i++) {
    point2 = sortedPoints[i];
    this.addLine(point1, point2, null, isAdd);
    point1 = point2;
  }
}
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
}
VUEChart.prototype.renderBar = function () {
  var self = this;
  $(this.ele).find('.chartBar').empty();
  for (var groupid in this.groups) {
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
      } else {
        self.setVisible(theGroupId, true);
      }
    });
  }
}
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
}
VUEChart.prototype.reScaleChart = function () {
  var maxXY = this.getMaxXY();
  var maxX = maxXY.maxx;
  var maxY = maxXY.maxy;
  var isRescale = false;
  console.log('maxx:' + maxX + ':maxy:' + maxY);
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
}
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
