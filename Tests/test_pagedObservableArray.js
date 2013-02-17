var sampleData = [{id:1,key:'1'}, {id:2,key:'2'},{id:3,key:'3'}, {id:4,key:'4'}, {id:5,key:'5'}, {id:6,key:'6'}, {id:7,key:'7'}, {id:8,key:'8'}, {id:9,key:'9'}, {id:10,key:'10'}, {id:11,key:'11'}, {id:12,key:'12'}, {id:13,key:'13'}, {id:14,key:'14'}, {id:15,key:'15'}];

/*
 * Fake API implementation used to "load" data - can be ignored
 */
var api = {
    //the method below is a fake example of loading data, and
    //would normally be replaced by a call to $.ajax
    fakeGetPage: function(option) {
        var defer = $.Deferred(),
			status = 'success',
			result;
        
        setTimeout(function() {
			result = {
                Count: sampleData.length,
                Data: sampleData.slice(option.pageIndex * option.pageSize, (option.pageIndex + 1) * option.pageSize)
            };
            defer.resolve(result, status);
        }, 1000);
        
        return defer;
    }
};

module("PagedObservableArray Tests");

test("require options to be passed", function () {
        throws(function() {
			var testSubject = ko.pagedObservableArray();
			},
			"Options not specified", 'error as expected');
		throws(function() {
			var testSubject =ko.pagedObservableArray({});
			},
			"options.loadPage", 'error as expected');
});
test( "test creation - no data load", 7, function() {
	var paged = new ko.pagedObservableArray({
            serverPaging: true,
			pageSize: 5,
			autoLoad: false,
            aggregateResults: false, //combine each page request locally
            loadPage: api.fakeGetPage,
            schema: { // describe the result format
                data: "Data", // the data which the data source will be bound to is in the "results" field
                count: "Count"
           }
        });
	ok(paged,'pagedObservable created');
	equal( paged.pageSize(), 5, 'pageSize set');
	equal( paged.allData().length, 0, 'data is empty');
	equal( paged.pageCount(),0,'pageCount is 0');
	equal( paged.totalCount(), 0, 'data count is 0');
	equal( paged.pageIndex(),1,'initial pagedIndes is 1');
	equal( paged.pageRange().length, 0, 'page range is 0');
});
test( "static load data", 10, function() {
	var paged = new ko.pagedObservableArray({
            serverPaging: true,
			pageSize: 5,
			data: sampleData,
			autoLoad: false,
            aggregateResults: false, //combine each page request locally
            loadPage: api.fakeGetPage,
            schema: { // describe the result format
                data: "Data", // the data which the data source will be bound to is in the "results" field
                count: "Count"
           }
        });
	ok(paged,'pagedObservable created');
	equal( paged.pageSize(), 5, 'pageSize set');
	equal( paged.allData().length, sampleData.length, 'data is set');
	equal( paged.pagedData().length, paged.pageSize(), 'pagedData is set');
	equal( paged.pageCount(),sampleData.length/paged.pageSize() ,'pageCount is same as sampleData');
	equal( paged.totalCount(), sampleData.length, 'data count is same as sampleData');
	equal( paged.pageIndex(),1,'initial pagedIndes is 1');
	equal( paged.pageRange().length, paged.pageCount(), 'page range is set');
	// now move index
	paged.nextPage();
	equal( paged.pageIndex(),2,'moved to next page');
	paged.previousPage();
	equal( paged.pageIndex(),1,'moved back');
});
asyncTest( "load data - not aggregated", 11, function() {
	var paged = new ko.pagedObservableArray({
            serverPaging: true,
			pageSize: 5,
			autoLoad: false,
            aggregateResults: false, //combine each page request locally
            loadPage: api.fakeGetPage,
            schema: { // describe the result format
                data: "Data", // the data which the data source will be bound to is in the "results" field
                count: "Count"
           }
        });
	ok(paged,'pagedObservable created');
	equal( paged.pageSize(), 5, 'pageSize set');
	equal( paged.allData().length, 0, 'data is empty');
	equal( paged.pageCount(),0,'pageCount is 0');
	equal( paged.totalCount(), 0, 'data count is 0');
	equal( paged.pageIndex(),1,'initial pagedIndes is 1');
	equal( paged.pageRange().length, 0, 'page range is 0');
	$.when(paged.load()).always(function(){
		equal( paged.totalCount(), sampleData.length, 'data count is same as sampleData');
		equal( paged.pageIndex(), 1, 'still at page 1');
		equal( paged.pageCount(),3,'pageCount is 3');
		equal( paged.pagedData().length, 5, 'pagedData is correct size');
		start();
	});
	
	
	
});