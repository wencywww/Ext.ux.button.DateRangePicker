Ext.define('Ext.ux.button.DateRangePicker', 
{
	extend: 'Ext.button.Button'
	,alias: 'widget.daterangepicker'			
	
	,requires:
	[
		'Ext.picker.Date',
		'Ext.form.field.Time'
	]
	,menu: 
	{
		plain: true, allowOtherMenus: true, 
		items:
		[
			{
				xtype: 'panel', frame: true, drpItemRole: 'pickContainer', layout: 'hbox', 
				items:
				[
					{
						xtype: 'container', drpItemRole: 'containerFrom', layout: {type: 'vbox', align: 'left'},
						items:
						[
							{xtype: 'datepicker', drpItemRole: 'pickFrom', 
								listeners: 
								{
									select: function(picker, date)
									{
										this.up('daterangepicker').setRange();			
									}
								}
							}	
						]
					}
				 ,{
						xtype: 'container', drpItemRole: 'containerTo', layout: {type: 'vbox', align: 'right'},
						items:
						[
								{xtype: 'datepicker', drpItemRole: 'pickTo', 
									listeners: 
									{
										select: function(picker, date)
										{
											this.up('daterangepicker').setRange();
										}
									}
								}		
						]
					}
				]
				
				,buttons: 
				[
					{
						xtype: 'button', drpItemRole: 'drpPresetPeriodsBtn', 
					  menu:
					  { allowOtherMenus: true, items:
							[
								{hideOnClick: false, drpItemRole: 'drpThisWeekPresetOption', handler: function() { this.up('daterangepicker').setPresetPeriod('thisWeek'); } },
								{hideOnClick: false, drpItemRole: 'drpLastWeekPresetOption', handler: function() { this.up('daterangepicker').setPresetPeriod('lastWeek'); } },
								{hideOnClick: false, drpItemRole: 'drpThisMonthPresetOption', handler: function() { this.up('daterangepicker').setPresetPeriod('thisMonth'); } },
								{hideOnClick: false, drpItemRole: 'drpLastMonthPresetOption', handler: function() { this.up('daterangepicker').setPresetPeriod('lastMonth'); } },
								{hideOnClick: false, drpItemRole: 'drpThisYearPresetOption', handler: function() { this.up('daterangepicker').setPresetPeriod('thisYear'); } },
							]
					  },

						//needed to hide the menu: http://www.sencha.com/forum/showthread.php?262407-Nested-buttons-with-menus/page2
						listeners: 
						{
						    afterrender: function (btn) {
						        btn.mon(btn.el, 'mousedown', function () {
						            if (btn.hasVisibleMenu()) {
						                btn.menu.hide();
						            }
						        });
						    }
						}

					}
				 ,{
				 	drpItemRole: 'confirmRangeBtn', 
				 		handler: function(btn)
						{
							btn.up('daterangepicker').setRange();
							btn.up('daterangepicker').hideMenu();
							if ( btn.prev('[drpItemRole=drpPresetPeriodsBtn]').hasVisibleMenu() ) 
							{ btn.prev('[drpItemRole=drpPresetPeriodsBtn]').menu.hide(); }		
						}
					}
				]

			}
		]
	}
	
													
	,initComponent: function()
	{
		var me = this;
		
		//component default configurations
		var defaults = 
		{
			selectedStart: null,
			selectedEnd: null,
			dateFormat: 'Y-m-d',
			showButtonTip: true,
			showTimePickers: false,
			timePickerFromValue: null,
			timePickerToValue: null,
			timeFormat: 'H:i:s',
			timePickersEditable: false,
			timeIncrement: 5, 
			timePickersQueryDelay: 500,
			timePickersWidth: 100,
			mainBtnTextPrefix: 'Period: ',	
			mainBtnIconCls: 'drp-icon-calendar',
			mainBtnTextColor: '#000000', 
			confirmBtnText: 'Set Range',
			confirmBtnIconCls: 'drp-icon-yes',
			presetPeriodsBtnText: 'Preset Periods',
			presetPeriodsBtnIconCls: 'drp-icon-calendar',
			presetPeriodsThisWeekText: 'This Week',
			presetPeriodsLastWeekText: 'Last Week',
			presetPeriodsThisMonthText: 'This Month',
			presetPeriodsLastMonthText: 'Last Month',
			presetPeriodsThisYearText: 'This Year',
			bindDateFields: false,
			boundStartField: null,
			boundEndField: null,
			diffPreciseUnits: null
		}
		
		//merge the defaults with the instance configurations if any
		me.drpDefaults = me.drpDefaults ? Ext.apply(defaults,me.drpDefaults): defaults;
		
		//check for invalid time formats and set them to defaults
		if ( 
				me.drpDefaults.showTimePickers &&
				(
				 Ext.Date.parse(me.drpDefaults.timePickerFromValue, me.drpDefaults.timeFormat) == null
				 || 
				 Ext.Date.parse(me.drpDefaults.timePickerToValue, me.drpDefaults.timeFormat) == null
				)
			 )
		{
				me.drpDefaults.timePickerFromValue = null;
				me.drpDefaults.timePickerToValue = null;
				me.drpDefaults.timeFormat = 'H:i:s';
		}
		
		
		var drpConfig = me.drpDefaults;
			
		me.on
		(
			{'afterrender': function()
					{
						
						me.setIconCls(drpConfig.mainBtnIconCls);
						
						me.down('button[drpItemRole=drpPresetPeriodsBtn]').setText(drpConfig.presetPeriodsBtnText);
						me.down('button[drpItemRole=drpPresetPeriodsBtn]').setIconCls(drpConfig.presetPeriodsBtnIconCls);
						me.down('menuitem[drpItemRole=drpThisWeekPresetOption]').setText(drpConfig.presetPeriodsThisWeekText);
						me.down('menuitem[drpItemRole=drpLastWeekPresetOption]').setText(drpConfig.presetPeriodsLastWeekText);
						me.down('menuitem[drpItemRole=drpThisMonthPresetOption]').setText(drpConfig.presetPeriodsThisMonthText);
						me.down('menuitem[drpItemRole=drpLastMonthPresetOption]').setText(drpConfig.presetPeriodsLastMonthText);
						me.down('menuitem[drpItemRole=drpThisYearPresetOption]').setText(drpConfig.presetPeriodsThisYearText);
						
						me.down('button[drpItemRole=confirmRangeBtn]').setText(drpConfig.confirmBtnText);
						me.down('button[drpItemRole=confirmRangeBtn]').setIconCls(drpConfig.confirmBtnIconCls);
						
						var panel = me.down('panel[drpItemRole=pickContainer]');
						var pickFrom = panel.down('datepicker[drpItemRole=pickFrom]');
						var pickTo = panel.down('datepicker[drpItemRole=pickTo]');
	
						//set the starting date if provided and valid, set it to the first day of the current month otherwise
						if ( drpConfig.selectedStart && Ext.Date.parse(drpConfig.selectedStart, 'Y-m-d', true) )
						{
							pickFrom.setValue( Ext.Date.parse(drpConfig.selectedStart, 'Y-m-d', true) );
						}else{
							var dt = new Date();
							pickFrom.setValue( Ext.Date.getFirstDateOfMonth(dt) );
						}
	
						//set the end date if provided and valid, otherwise it is automatically set to today by the datepicker
						if ( drpConfig.selectedEnd && Ext.Date.parse(drpConfig.selectedEnd, 'Y-m-d', true) )
						{ 
							pickTo.setValue( Ext.Date.parse(drpConfig.selectedEnd, 'Y-m-d', true) ); 
						}
	
						//add time pickers if requested
						if ( drpConfig.showTimePickers )								
						{
							var fromContainer = panel.down('container[drpItemRole=containerFrom]');
							var toContainer = panel.down('container[drpItemRole=containerTo]');							
							
							fromContainer.add(
							{
								xtype: 'timefield', drpItemRole: 'timePickerFrom'
								,allowBlank: false
								,increment: drpConfig.timeIncrement, format: drpConfig.timeFormat, editable: drpConfig.timePickersEditable
								,width: drpConfig.timePickersWidth
								,value: Ext.isEmpty(drpConfig.timePickerFromValue) ? 
												Ext.Date.parse('00:00:00','00:00:00') : 
												Ext.Date.parse(drpConfig.timePickerFromValue, drpConfig.timeFormat) 
								,queryDelay: drpConfig.timePickersQueryDelay
								,listeners: 
								 { 
								 	change: function(fld,newVal,oldVal) 
								 	{ 
								 		if ( !fld.isValid() ) { fld.setValue(oldVal); }
								 		fld.up('daterangepicker').setSecondMinDate();
								 		fld.up('daterangepicker').setRange();  
								 	}
								 } 
							}
							);
							toContainer.add(
							{
								xtype: 'timefield', drpItemRole: 'timePickerTo' 
								,allowBlank: false 
								,increment: drpConfig.timeIncrement, format: drpConfig.timeFormat, editable: drpConfig.timePickersEditable
								,width: drpConfig.timePickersWidth
								,value: Ext.isEmpty(drpConfig.timePickerToValue) ? 
												new Date() : 
												Ext.Date.parse(drpConfig.timePickerToValue, drpConfig.timeFormat) 
								,queryDelay: drpConfig.timePickersQueryDelay
								,listeners: 
								 { 
								 	change: function(fld,newVal,oldVal) 
								 	{ 
								 		if ( !fld.isValid() ) { fld.setValue(oldVal); }
								 		fld.up('daterangepicker').setSecondMinDate();
								 		fld.up('daterangepicker').setRange();  
								 	} 
								 } 
							}
							);
						}
			
						me.setRange();
	
					}
	
			}
		);
			
		me.callParent();

	}

	//update the main button text
	,setRange: function()
	{
		var me = this;
		
		me.setSecondMinDate(); //needed under some circumstnaces where date pickers do not fire its select event (open the second picker, select year in the past, click confirm)
		
		var drpConfig = me.drpDefaults;
		
		var panel = me.down('panel[drpItemRole=pickContainer]');
		var dFrom = Ext.Date.format(panel.down('datepicker[drpItemRole=pickFrom]').getValue(), drpConfig.dateFormat);
		var dTo = Ext.Date.format(panel.down('datepicker[drpItemRole=pickTo]').getValue(), drpConfig.dateFormat);
							
		me.setText(drpConfig.mainBtnTextPrefix + '<b style="color: ' + drpConfig.mainBtnTextColor + '">' + dFrom + ' - ' + dTo + '</b>');
		
		if (drpConfig.showButtonTip)
		{
			var tTipText = 
						dFrom + 
						(drpConfig.showTimePickers ? ' ' + Ext.Date.format(me.down('timefield[drpItemRole=timePickerFrom]').getValue(), drpConfig.timeFormat) : '') + 
						' - ' + 
						dTo + 
						(drpConfig.showTimePickers ? ' ' + Ext.Date.format(me.down('timefield[drpItemRole=timePickerTo]').getValue(), drpConfig.timeFormat) : '');
						
			me.setTooltip(tTipText);
		}
		
		//update bound datefields if any
		if (
				drpConfig.bindDateFields && drpConfig.boundStartField && drpConfig.boundEndField && 
				drpConfig.boundStartField.isComponent && drpConfig.boundStartField.isXType('datefield') &&
				drpConfig.boundEndField.isComponent && drpConfig.boundEndField.isXType('datefield')
			 )
		{
			drpConfig.boundStartField.setValue( panel.down('datepicker[drpItemRole=pickFrom]').getValue() );
			drpConfig.boundEndField.setValue( panel.down('datepicker[drpItemRole=pickTo]').getValue() );
		}
	}

	//set the second pickers values according to the first one so that the first date time to be always <= from the second one
	,setSecondMinDate: function()
	{
		var me = this;
		var drpConfig = me.drpDefaults;
		
		var panel = me.menu.items.items[0];
		var dStart = panel.down('datepicker[drpItemRole=pickFrom]').getValue();		
		panel.down('datepicker[drpItemRole=pickTo]').setMinDate( dStart );
		var dEnd = panel.down('datepicker[drpItemRole=pickTo]').getValue();

		if ( dStart.getTime() > dEnd.getTime() )
		{
			panel.down('datepicker[drpItemRole=pickTo]').setValue( dStart );
		}
		
		//check the times after adjusting the dates
		if (drpConfig.showTimePickers)
		{
			var dStart = panel.down('datepicker[drpItemRole=pickFrom]').getValue();
			var dEnd = panel.down('datepicker[drpItemRole=pickTo]').getValue();
			
			if ( dStart.getTime() == dEnd.getTime() )
			{
				//Ext framework versions produce inconsistent results via getTime() method on a timefields (it return js date objects)
				//We need to compare only the time fields (we are here because the dates are equal), so
				//lets create a fixed temporary dates in a form of '2015-01-01 H:i:s' and run the getTime() on them
				
				var tFrom = panel.down('timefield[drpItemRole=timePickerFrom]').getValue();
				var tTo = panel.down('timefield[drpItemRole=timePickerTo]').getValue();
				
				var compDateFrom = Ext.Date.parse('2015-01-01 ' + Ext.Date.format(tFrom, 'H:i:s'), 'Y-m-d H:i:s');
				var compDateTo = Ext.Date.parse('2015-01-01 ' + Ext.Date.format(tTo, 'H:i:s'), 'Y-m-d H:i:s');
				
				if ( compDateFrom.getTime() > compDateTo.getTime() )
				{ panel.down('timefield[drpItemRole=timePickerTo]').setValue( panel.down('timefield[drpItemRole=timePickerFrom]').getValue() ); }
			}
		}

	}
	
	//set the preset periods	
	,setPresetPeriod: function(period)
	{
		var me = this;
		var pickerFrom = me.down('datepicker[drpItemRole=pickFrom]');
		var pickerTo = me.down('datepicker[drpItemRole=pickTo]');
		
		switch(period) 
		{
	    case 'thisWeek':
	        var diff, dt = new Date(); // Today's date
					diff = (dt.getDay() + 6) % 7; // Number of days to subtract
					var lastMonday  = new Date(dt - diff * 24*60*60*1000); // Do the subtraction
					pickerFrom.setValue( lastMonday );
					pickerTo.selectToday();
	    break;
			
			case 'lastWeek':
					var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
							,day = beforeOneWeek.getDay()
							,diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
							,prevWeekMonday = new Date(beforeOneWeek.setDate(diffToMonday))
								  //, prevWeekSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6)); //not correct if the months differ
							,prevWeekSunday = Ext.Date.add(prevWeekMonday, Ext.Date.DAY, 6); 

					pickerFrom.setValue( prevWeekMonday );
					pickerTo.setValue( prevWeekSunday );
	    break;
			
			case 'thisMonth':
					var dt = new Date();
					pickerFrom.setValue( Ext.Date.getFirstDateOfMonth( dt ) );
					pickerTo.selectToday();
	    break;
			
			case 'lastMonth':
					var dt = new Date(); var Year = dt.getFullYear(); var Month = dt.getMonth(); //Month is ZERO-based!!!
					//Ext.Date.parse uses 1-based month numbers, so if we receive 0(January) for the Month, then we must set Month to 12 and decrease Year with 1
					//in order to produce the previous month
					if (Month == 0) { Month = 12; Year = Year -1; }
						
					Month = Month < 10 ? '0' + Month : Month;
					var newDate = Ext.Date.parse(Year + '-' + Month + '-01', 'Y-m-d');
					pickerFrom.setValue( newDate );
					pickerTo.setValue( Ext.Date.getLastDateOfMonth( newDate ) );
	    break;
	    
	    case 'thisYear':
					var dt = new Date(); var Year = dt.getFullYear();
					var newDate = Ext.Date.parse(Year + '-01-01', 'Y-m-d');
					pickerFrom.setValue( newDate );
					pickerTo.selectToday();
	    break;
	    
	    default:
	    return;
		}
		
		me.setRange();					
	}

	//returns an object with various details of the choosen period
	//2016-09-10: method renamed to getPickerValue, because getValue will conflict with the button getValue private method, Ext 6.2.0
	,getPickerValue: function()
	{
		var me = this;
		var drpConfig = me.drpDefaults;
		
		var startDatePicker = me.down('datepicker[drpItemRole=pickFrom]');
		var endDatePicker = me.down('datepicker[drpItemRole=pickTo]');
		if (drpConfig.showTimePickers)
		{
			var startTimeField = me.down('timefield[drpItemRole=timePickerFrom]');
			var endTimeField = me.down('timefield[drpItemRole=timePickerTo]');
		}
		
		//start/end dates as a JS objects
		var startDateObj = startDatePicker.getValue();
		var endDateObj = endDatePicker.getValue();
		
		//start/end dates as string in Y-m-d format
		var startDateYmd = Ext.Date.format(startDateObj, 'Y-m-d');
		var endDateYmd = Ext.Date.format(endDateObj, 'Y-m-d');
		
		//start/end dates as string in the user-provided format
		var startDateFmt = Ext.Date.format(startDateObj, drpConfig.dateFormat);
		var endDateFmt = Ext.Date.format(endDateObj, drpConfig.dateFormat);
											
		
		if (drpConfig.showTimePickers)
		{
			//start/end times as strings in H:i:s format
			var startTimeHis = Ext.Date.format(startTimeField.getValue(), 'H:i:s');
			var endTimeHis = Ext.Date.format(endTimeField.getValue(), 'H:i:s');
			
			//start/end times as strings in the user-provided format
			var startTimeFmt = Ext.Date.format(startTimeField.getValue(), drpConfig.timeFormat);
			var endTimeFmt = Ext.Date.format(endTimeField.getValue(), drpConfig.timeFormat);
		}
		
		
		var dateFields = {
			startDateYmd: startDateYmd,
			startDateFmt: startDateFmt,
			startDateObj: startDateObj,
			startDateDayOfYear: Ext.Date.getDayOfYear(startDateObj), //0-based day of the year of the start date
			startDateYear: Ext.Date.format(startDateObj, 'Y'),
			startDateYearIsLeap: Ext.Date.isLeapYear(startDateObj), //boolean check for a leap year
			startDateMonthNumber: Ext.Date.format(startDateObj, 'm'), //month number of the start date (01-12)
			startDateMonthName: Ext.Date.format(startDateObj, 'F'),  //month name of the start date (according to the current Ext locale)
			startDateWeekNumber: Ext.Date.format(startDateObj, 'W'), //ISO-8601 week number of year, weeks starting on Monday
			startDateDay: Ext.Date.format(startDateObj, 'd'), //day number of the start date (01-31)
			startDateDayName: Ext.Date.format(startDateObj, 'l'), //day name of the start date (Monday-Sunday, according to the current Ext locale)
			startDateDayOfWeek: Ext.Date.format(startDateObj, 'N'), //ISO-8601 numeric representation of the day of the week (1-Monday ... 7-Sunday)
			
			endDateYmd: endDateYmd,
			endDateFmt: endDateFmt,
			endDateObj: endDateObj,
			endDateDayOfYear: Ext.Date.getDayOfYear(endDateObj), //0-based day of the year of the end date
			endDateYear: Ext.Date.format(endDateObj, 'Y'),
			endDateYearIsLeap: Ext.Date.isLeapYear(endDateObj), //boolean check for a leap year
			endDateMonthNumber: Ext.Date.format(endDateObj, 'm'), //month number of the end date (01-12)
			endDateMonthName: Ext.Date.format(endDateObj, 'F'),  //month name of the end date (according to the current Ext locale)
			endDateWeekNumber: Ext.Date.format(endDateObj, 'W'), //ISO-8601 week number of year, weeks ending on Monday
			endDateDay: Ext.Date.format(endDateObj, 'd'), //day number of the end date (01-31)
			endDateDayName: Ext.Date.format(endDateObj, 'l'), //day name of the end date (Monday-Sunday, according to the current Ext locale)
			endDateDayOfWeek: Ext.Date.format(endDateObj, 'N') //ISO-8601 numeric representation of the day of the week (1-Monday ... 7-Sunday)
		};
		
		if (drpConfig.showTimePickers)
		{
			var timeFields = {
				startTimeHis: startTimeHis,
				startTimeFmt: startTimeFmt,
				startDateTimeYmdHis: startDateYmd + ' ' + startTimeHis,
				startDateTimeFmt: startDateFmt + ' ' + startTimeFmt,
				startDateObj: Ext.Date.parse(startDateYmd + ' ' + startTimeHis, 'Y-m-d H:i:s'), //add the time to the date object
				
				endTimeHis: endTimeHis,
				endTimeFmt: endTimeFmt,
				endDateTimeYmdHis: endDateYmd + ' ' + endTimeHis,
				endDateTimeFmt: endDateFmt + ' ' + endTimeFmt,
				endDateObj: Ext.Date.parse(endDateYmd + ' ' + endTimeHis, 'Y-m-d H:i:s') //add the time to the date object
			};
		}
		
		var retObj = Ext.apply(dateFields,timeFields);
		
		//add period info
		var periodInfo = 
		{
			periodYmdHis: Ext.Date.format(retObj.startDateObj, 'Y-m-d H:i:s') + ' - ' + Ext.Date.format(retObj.endDateObj, 'Y-m-d H:i:s'),
			periodFmt: Ext.Date.format(retObj.startDateObj, drpConfig.dateFormat + ' ' + drpConfig.timeFormat) + ' - ' + 
								 Ext.Date.format(retObj.endDateObj, drpConfig.dateFormat + ' ' + drpConfig.timeFormat),
			yearsCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'y'),	//full years within the period
			monthsCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'mo'),	//full months within the period
			weeksCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'w'),	//full weeks within the period (seconds divided by 604800)
			daysCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'd'),	//full days within the period
			hoursCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'h'),	//full hours within the period
			minutesCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'mi'),	//full minutes within the period
			secondsCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 's'),	//full seconds within the period
			millisecondsCount: Ext.Date.diff(retObj.startDateObj, retObj.endDateObj, 'ms'),	//milliseconds within the period
		}
		
		return Ext.apply(retObj, 
										{ 
											periodDetails: periodInfo, 
											periodDetailsPrecise: Ext.Date.diffPrecise(retObj.startDateObj, retObj.endDateObj, drpConfig.diffPreciseUnits) 
										});
	}
			
		
});

//Ext.Date lacks the diff() method prior to version 5.0, 
//so we have to define one if we are running on 4.x (it is simply copied form the Ext 6.0.0 source)
if (Ext.getVersion().major < 5 )
{
	
	Ext.define('DRPOverride.Ext.Date', 
	{
	    override: 'Ext.Date'
	  	,diff: function (min, max, unit) 
			{
		        var est, diff = +max - min; //returns diff as milliseconds
		        switch (unit) 
		        {
		            case Ext.Date.MILLI:
		                return diff;
		            case Ext.Date.SECOND:
		                return Math.floor(diff / 1000);
		            case Ext.Date.MINUTE:
		                return Math.floor(diff / 60000);
		            case Ext.Date.HOUR:
		                return Math.floor(diff / 3600000);
		            case Ext.Date.DAY:
		                return Math.floor(diff / 86400000);
		            case 'w':
		                return Math.floor(diff / 604800000);
		            case Ext.Date.MONTH:
		                est = (max.getFullYear() * 12 + max.getMonth()) - (min.getFullYear() * 12 + min.getMonth());
		                if (Ext.Date.add(min, unit, est) > max) {
		                    return est - 1;
		                }
		                return est;
		            case Ext.Date.YEAR:
		                est = max.getFullYear() - min.getFullYear();
		                if (Ext.Date.add(min, unit, est) > max) {
		                    return est - 1;
		                } else {
		                    return est;
		                }
		        }
		  }  
	});

}

//Add the diffPrecise() method to Ext.date
//adapted code from https://github.com/codebox/moment-precise-range
//(Precise range is a plugin for the moment.js library to display human-readable date/time ranges)
//diffPrecise uses two JS Object instances as arguments
//returns an object with precised period details, eg. the period between 2015-10-15 and 2016-11-16
//is represented as '1 year 1 month 1 day' instead of 1 year 13 months 398 days as will return the normal Ext.Date.diff()
//takes the time differences in account, also
Ext.define('DRPOverridePrecise.Ext.Date', 
{
	 override: 'Ext.Date'
	,diffPrecise: function (dMin, dMax, unitCaptions) 
	{
		
		var STRINGS = {
        nodiff: '',
        year: 'year',
        years: 'years',
        month: 'month',
        months: 'months',
        day: 'day',
        days: 'days',
        hour: 'hour',
        hours: 'hours',
        minute: 'minute',
        minutes: 'minutes',
        second: 'second',
        seconds: 'seconds',
        delimiter: ' '
    };
    
    if (unitCaptions)
    {
    	Ext.apply(STRINGS, unitCaptions);
    }
    
    if (Ext.Date.isEqual(dMin,dMax)) 
    {
       //return STRINGS.nodiff;
    }
    
    if (dMin > dMax) 
    {
       var tmp = dMin;
       dMin = dMax;
       dMax = tmp;
    }
    
    var yDiff = dMax.getFullYear() - dMin.getFullYear();
    var mDiff = dMax.getMonth() - dMin.getMonth();
    var dDiff = dMax.getDate() - dMin.getDate();
    var hourDiff = dMax.getHours() - dMin.getHours();
    var minDiff = dMax.getMinutes() - dMin.getMinutes();
    var secDiff = dMax.getSeconds() - dMin.getSeconds();
    
    if (secDiff < 0) 
    {
            secDiff = 60 + secDiff;
            minDiff--;
    }
    
    if (minDiff < 0) 
    {
        minDiff = 60 + minDiff;
        hourDiff--;
    }
  
    if (hourDiff < 0) 
    {
        hourDiff = 24 + hourDiff;
        dDiff--;
    }
    
    if (dDiff < 0) 
    {
        var daysInLastFullMonth = Ext.Date.getDaysInMonth( Ext.Date.subtract( dMax, Ext.Date.MONTH, 1)  );
        if ( daysInLastFullMonth < dMin.getDate() ) { // 31/01 -> 2/03
          dDiff = daysInLastFullMonth + dDiff + (dMin.getDate() - daysInLastFullMonth);
        } else {
          dDiff = daysInLastFullMonth + dDiff;
        }
        mDiff--;
    }
    
    if (mDiff < 0) 
    {
        mDiff = 12 + mDiff;
        yDiff--;
    }
	
		function pluralize(num, word) 
		{
      return num + ' ' + STRINGS[word + (num === 1 ? '' : 's')];
    }
    
    var result = [];

    if (yDiff) {
        result.push(pluralize(yDiff, 'year'));
    }
    if (mDiff) {
        result.push(pluralize(mDiff, 'month'));
    }
    if (dDiff) {
        result.push(pluralize(dDiff, 'day'));
    }
    if (hourDiff) {
        result.push(pluralize(hourDiff, 'hour'));
    }
    if (minDiff) {
        result.push(pluralize(minDiff, 'minute'));
    }
    if (secDiff) {
        result.push(pluralize(secDiff, 'second'));
    }

    var retObj = {};
    
    retObj.diffAsText = result.join(STRINGS.delimiter);
    Ext.apply(retObj, {years: yDiff, months: mDiff, days: dDiff, hours: hourDiff, minutes: minDiff, seconds: secDiff});
    return retObj;
    
    
	
	}  
});
