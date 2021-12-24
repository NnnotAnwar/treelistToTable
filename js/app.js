$(function () {
    let $ = jQuery;
    let btn = document.querySelector('.checkboxBtn');
    let dataPlace = document.querySelector('#data-placement');
    btn.disabled = true;
    let allExpandedParent = [];
    let expandedParent = [];
    let allNotExpanded = [];
    let notExpanded = [];
    let parentRow = [];
    let fields = [];
    let rowData = {};
    let crudServiceBaseUrl = 'https://demos.telerik.com/kendo-ui/service';

    let dataSource = new kendo.data.TreeListDataSource({
        transport: {
            read: {
                url: crudServiceBaseUrl + '/EmployeeDirectory',
                // url: crudServiceBaseUrl + '/EmployeeDirectory/All',
                dataType: 'jsonp'
            }
        },
        schema: {
            model: {
                id: 'EmployeeId',
                parentId: 'ReportsTo',
                fields: {
                    EmployeeId: { type: 'number', nullable: false },
                    ReportsTo: { field: 'ReportsTo', nullable: true }
                },
                // expanded: true
            },
        }
    });

    let buildTreeList = () => {
        $('#treelist').kendoTreeList({
            dataSource: dataSource,
            columns: [
                { field: 'FirstName', expandable: true, title: 'First Name', width: 250 },
                { field: 'LastName', title: 'Last Name' },
                { field: 'Position' },
                { field: 'Extension', title: 'Ext', format: '{0:#}' }
            ],
            dataBound: function (e) {
                btn.disabled = false;
                let DS = e.sender.dataSource.data()
                dataPlace.textContent = js_beautify(JSON.stringify(DS.toJSON()));
                for (let i = 0; i < DS.length; i++) {
                    let row = DS[i]
                    if (row.hasChildren) { allExpandedParent.push(row) } else { allNotExpanded.push(row) }
                }
                notExpanded = [];
                for (let i in e.sender.columns) {
                    let item = e.sender.columns[i];
                    if (fields.length <= i) {
                        fields.push({ id: i, field: item.field, title: item.title || item.field });
                    }
                };
                for (let i = 0; i < DS.length; i++) {
                    let data = DS[i];
                    if (!data.expanded) { notExpanded.push(data); };
                };
            },
            expand: function (e) {
                // notExpanded = [];
                let expTarget = e.model._loaded;
                for (let i in e.sender.columns) {
                    let item = e.sender.columns[i];
                    if (fields.length <= i) {
                        fields.push({ id: i, field: item.field, title: item.title || item.field });
                    }
                };
                for (let i = 0; i < e.sender.dataSource.data().length; i++) {
                    let data = e.sender.dataSource.data()[i];
                }
                if (!expTarget) { expandedParent.push(e.model) };
            }
        });
    };

    buildTreeList();

    btn.addEventListener('click', (e) => {
        document.querySelector('#treelist').innerHTML = '';
        document.querySelector('#treelist').style.width = '';
        let columns = [];
        let levels = [];
        let expandedRowIds = [];
        let nonExpParentId;
        let newDS = dataSource.data();
        if (expandedParent.length === 0 && notExpanded.length === 0) {
            expandedParent = allExpandedParent;
            notExpanded = allNotExpanded;
        }
        allExpandedParent = [];
        allNotExpanded = [];
        if (expandedParent.length === 0 && notExpanded.length > 0) {
            for (let row of notExpanded) {
                if (row.hasChildren) {
                    allExpandedParent.push(row)
                } else {
                    allNotExpanded.push(row)
                }
            }
            expandedParent = allExpandedParent;
            allNotExpanded = allNotExpanded;
        }

        if (newDS.length === 1) {
            expandedParent = [];
        }
        for (let item of expandedParent) {
            expandedRowIds.push(item.id);
        };
        for (let i = 0; i < newDS.length; i++) {
            let data = newDS[i];
            for (let id of expandedRowIds) {
                if (data.id === id) {
                    rowData[id] = data;
                    rowData.length = id;
                };
            };
            for (let item of fields) {
                let level = dataSource.level(data);
                data[`${item.field + level}`] = data[item.field];
            };
            levels.push(dataSource.level(data));
        };
        levels = [...new Set(levels)];
        for (let item of fields) {
            for (let i in levels) {
                columns.push(
                    { field: item.field + i, title: `${item.title} ${Number(i) + 1}` }
                )
            }
        };
        for (let nonExpRow of notExpanded) {
            for (let expRow of expandedParent) {
                if (nonExpRow.parentId === expRow.id) {
                    for (let item of fields) {
                        nonExpRow[`${item.field + dataSource.level(expRow)}`] = expRow[item.field];
                    };
                    nonExpParentId = nonExpRow.parentId;
                    while (nonExpParentId) {
                        for (let i = 0; i < newDS.length; i++) {
                            let data = newDS[i]
                            if (data.id == nonExpParentId) {
                                for (let item of fields) {
                                    nonExpRow[`${item.field + dataSource.level(data)}`] = data[item.field];
                                };
                                nonExpParentId = data.parentId;
                            }
                        }
                    }
                }
            }
        }
        if (expandedParent.length === 0) {
            columns = [
                { field: 'FirstName', title: 'First Name', width: 250 },
                { field: 'LastName', title: 'Last Name' },
                { field: 'Position' },
                { field: 'Extension', title: 'Ext', format: '{0:#}' }
            ]
        }
        if (btn.checked) {
            $('#treelist').kendoGrid({
                dataSource: newDS,
                columns: columns,
                width: columns.length * 200
            });
            let grid = $("#treelist").data("kendoGrid");
            for (let id of expandedRowIds) {
                var rowUID = grid.dataSource.get(id).uid;
                $("[data-uid='" + rowUID + "']", grid.tbody).css({ 'display': 'none' });
            };
        } else {
            buildTreeList();
        }
    })
});