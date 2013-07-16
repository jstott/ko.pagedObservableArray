/*global ko: false*/

// By: James Stott
// https://github.com/jstott/KoLite.git
//
// Knockout.pagedObservableArray
//
// Depends on scripts:
//			jquery
//          Knockout
//
//  Notes:
//          Special thanks to John Papa and Steve Greatrex for 
//          their examples.
//
//  Usage:      
//          To Setup Tracking, add this tracker property to your viewModel    
//              ===> pagedRosters = new ko.pagedObservableArray({
//            serverPaging: true,
//            pageSize: 10,
//            aggregateResults: false, //combine each page request locally
//            loadPage: function(options) { // options will contain contents of parameterMap or pageSize/pageIndex
//                return viewModel.getRosterClasses(options);
//            },
//           parameterMap: function(options) {
//                var parameters = {
//                    id: config.currentUser().id(),
//                    //additional parameters sent to the remote service
//                   pageSize: options.pageSize,
//                    page: options.pageIndex + 1 //next page
//                };
//                return parameters;
//            },
//            schema: { // describe the result format
//                data: "Data", // the data which the data source will be bound to is in the "results" field
//                count: "Count"
//            }
//        })
//
//          
////////////////////////////////////////////////////////////////////////////////////////

(function ($, ko) {
    "use strict";

    ko.pagedObservableArray = function (options) {

        if (!options) { throw "Options not specified"; }
        if (!options.loadPage) { throw "loadPage not specified on options"; }

        options.schema = options.schema || { data: 'Data', count: 'Count' };

        var
            self = this,

		//the complete data collection
	     _allData = ko.observableArray(options.data || []),

		//the size of the pages to display
	     _pageSize = ko.observable(options.pageSize || 10),

		//the index of the current page
	     _pageIndex = ko.observable(1),

		//the total count
		_totalCount = ko.observable(_allData().length ),

		//the number of pages
		_pageCount = ko.computed(function () {
		    var count = 0;
		    if (_totalCount() > 0)
		        count = Math.ceil(ko.utils.unwrapObservable(_totalCount) / ko.utils.unwrapObservable(_pageSize));
		    else
		        count = Math.ceil(_allData().length / ko.utils.unwrapObservable(_pageSize));
		    return count;//== 0 ? 1 : count;
		}),

        _pageRange = ko.computed(function () {
            var
                pages = [],
                cnt = _pageCount();
            for (var i = 1; i <= cnt; i++) {
                pages.push(i);
            }
            return pages;
            // return [1, 2, 3, 4];
        }),

		//the current page data
		_pagedData = ko.computed(function () {
		    var pageSize = _pageSize(),
				pageIndex = _pageIndex(),
				startIndex = pageSize * pageIndex,
				endIndex = pageSize * (pageIndex + 1);
		    if (!options.serverPaging && (options.aggregateResults || options.data)) {
		        return _allData().slice(startIndex, endIndex);
		    } else {
		        return _allData();
		    }
		}, self),

        // option to externally handle mapping of remote data
        _map = options.map,
		_defer: function(action) {
			if (options.defer) {
				return options.defer(action);
			} else {
				return $.Deferred(action);
			}
        },
        _loading = ko.observable(false),

		//load a page of data, then display it
		_loadPage = function () {
		    return $.Deferred(function (def) {
		        var deferred,
					paramOptions = { pageSize: _pageSize(), pageIndex: _pageIndex() };

		        _loading(true);
		        if (options.parameterMap)
		            paramOptions = options.parameterMap(paramOptions); // let consumer option to modify params

		        deferred = options.loadPage(paramOptions);
		        $.when(deferred).then(function (data, status) {
		            //var tmpArray = options.aggregateResults ? ko.utils.unwrapObservable(_allData()) || [] : [];
		            var tmpArray = [];
		            if (data && data[options.schema.data]) {
		                if (_map)
		                    tmpArray = _map(data[options.schema.data]);
		                else
		                    tmpArray.push.apply(tmpArray, data[options.schema.data]);
		                if (options.aggregateResults)
		                    ko.utils.arrayPushAll(_allData, tmpArray);
		                else
		                    _allData(tmpArray);

		                _allData.valueHasMutated();
		                _totalCount(data[options.schema.count] || 0); // capture count of items
		                def.resolve(_totalCount());
		            } else {
		                def.reject(status);
		            }
		        }).always(function () {
		            _loading(false);
		        });
		    }).promise();
		},

        _refresh = function () {
            _loadPage();
        },

		//move to the next page
	    _nextPage = function () {
	        if (_pageIndex() < _pageCount()) {
	            _pageIndex(_pageIndex() + 1);
	            _loadPage();
	        }
	    },
        _moveToPage = function (index) {
            if (_pageIndex() !== index) {
                _pageIndex(index);
                _loadPage();
            }
        },
		//move to the previous page
	    _previousPage = function () {
	        if (_pageIndex() > 1) {
	            _pageIndex(_pageIndex() - 1);
	            _loadPage();
	        }
	    };

        //reset page index when page size changes
        _pageSize.subscribe(function () {
            _pageIndex(0);
            _loadPage();
        });
        //_allData.subscribe(function () { _pageIndex(0); });

        if (options.autoLoad)
            _loadPage();

        //public members
        self.allData = _allData;
        self.pagedData = _pagedData;
        self.load = _loadPage;
        self.pageRange = _pageRange;
        self.pageSize = _pageSize;
        self.pageIndex = _pageIndex;
        //self.page = _page;
        self.pageCount = _pageCount;
        self.nextPage = _nextPage;
        self.moveToPage = _moveToPage;
        self.previousPage = _previousPage;
        self.refresh = _refresh;
        self.totalCount = _totalCount;
        self.loading = _loading;
        self.refresh = _refresh;

    };
}($, ko));