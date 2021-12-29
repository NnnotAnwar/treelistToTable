$(function () {
    let $ = jQuery;
    let btn = document.querySelector('.checkboxBtn');
    let dataPlace = document.querySelector('#data-placement');
    // btn.disabled = true;
    let crudServiceBaseUrl = 'https://demos.telerik.com/kendo-ui/service';
    let dataSource = new kendo.data.TreeListDataSource({
        transport: {
            read: {
                // url: crudServiceBaseUrl + '/EmployeeDirectory/All',
                url: crudServiceBaseUrl + '/EmployeeDirectory',
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
    let columns = [
        { field: 'FirstName', title: 'First Name' }
    ]

    // let dsLoop = function (data, func) {
    //     for (let i = 0; i < data.length; i++) {
    //         func(data)
    //     }
    // }

    dataSource.read().then((e) => {
        let data = dataSource.data();
        let expandedRows = [];
        let fields = [];
        let isModfied;
        for (let item of columns) {
            fields.push(item.field);
        };
        // data[0].FirstName = 'Сын'
        $("#treelist").kendoTreeList({
            dataSource: dataSource,
            columns: columns,
            dataBound: (e) => {
                var grid = e.sender;
                let dataSource = e.sender.dataSource;
                let data = dataSource.data();
                let notExpandedRows = [];
                let levels = [];
                dataPlace.textContent = js_beautify(JSON.stringify(data.toJSON()));
                if (expandedRows.length === 0) {
                    notExpandedRows = [];
                    for (let i = 0; i < data.length; i++) {
                        let row = data[i];
                        if (row.hasChildren) {
                            expandedRows.push(row)
                        } else {
                            notExpandedRows.push(row)
                        }
                    }
                }
                for (let i = 0; i < data.length; i++) {
                    let evRow = data[i];
                    if (!evRow.expanded) {
                        notExpandedRows.push(evRow);
                    };
                    levels.push(dataSource.level(evRow));
                };
                levels = [...new Set(levels)]
                for (let expandedRow of expandedRows) {
                    for (let notExpandedRow of notExpandedRows) {
                        if (notExpandedRow.parentId === expandedRow.id) {
                            for (let field of fields) {
                                notExpandedRow[field + dataSource.level(notExpandedRow)] = notExpandedRow[field];
                                notExpandedRow[field + dataSource.level(expandedRow)] = expandedRow[field];
                            };
                            let notExpRowPID = notExpandedRow.parentId;
                            while (notExpRowPID) {
                                for (let i = 0; i < data.length; i++) {
                                    let row = data[i];
                                    if (notExpRowPID === row.id) {
                                        for (let field of fields) {
                                            notExpandedRow[field + dataSource.level(row)] = row[field];
                                        };
                                        notExpRowPID = row.parentId;
                                    };
                                };
                            };
                        };
                    };
                };
                if (btn.checked) {
                    // columns = [{ field: "FirstName" }, { field: "FirstName0" }]
                    // e.sender.setOptions({ "columns": columns });
                    grid.newColumns = [];
                    for (let level of levels) {
                        for (let item of grid.oldColumns) {
                            let title = item.title || item.field;
                            grid.newColumns.push({ field: `${item.field}${level}`, title: `${title} ${level}` })
                        };
                    };
                    let setColumns = [...grid.oldColumns, ...grid.newColumns];
                    for (let i = 0; i < data.length; i++) {
                        let row = data[i];
                        let item = grid.dataSource.get(row.id);
                        let tr = $("[data-uid='" + item.uid + "']", grid.tbody);
                        tr.css({ 'display': 'table-row' });
                    }
                    for (let expandedRow of expandedRows) {
                        let item = grid.dataSource.get(expandedRow.id);
                        let tr = $("[data-uid='" + item.uid + "']", grid.tbody);
                        tr.css({ 'display': 'none' });
                    };
                    if (grid.columns.length !== setColumns.length) {
                        grid.setOptions({ 'columns': setColumns });
                    };

                } else {
                    for (let i = 0; i < data.length; i++) {
                        let row = data[i];
                        var htmlRow = e.sender.itemFor(row);
                        $(htmlRow).css({ "display": "table-row" });
                    };
                };
            },
            expand: (e) => {
                var grid = e.sender;
                let dataSource = e.sender.dataSource;
                let row = e.model;
                let levels = [];
                grid.oldColumns = grid.oldColumns || columns;
                if (!row._loaded) {
                    expandedRows.push(row);
                }
            },
            collapse: (e) => {
                let dataSource = e.sender.dataSource;
                let data = dataSource.data();
            },
            change: (e) => {
                let dataSource = e.sender.dataSource;
                let data = dataSource.data();
            }
        })
        btn.addEventListener('change', (e) => {
            let grid = kendo.widgetInstance($('#treelist'));
            let dataSource = grid.dataSource;
            let data = dataSource.data();
            let columns = grid.columns;
            let toggle = e.target;
            grid.oldColumns = grid.oldColumns || grid.columns;
            if (toggle.checked) {
                // grid.setOptions({ "columns": columns });
                grid.newColumns = [];
                let levels = [];
                for (let i = 0; i < data.length; i++) {
                    let row = data[i];
                    levels.push(dataSource.level(row));
                };
                levels = [...new Set(levels)]
                for (let level of levels) {
                    for (let item of grid.oldColumns) {
                        let title = item.title || item.field;
                        grid.newColumns.push({ field: `${item.field}${level}`, title: `${title} ${level}` })
                    }
                };
                let setColumns = [...grid.oldColumns, ...grid.newColumns]
                grid.setOptions({ columns: setColumns })
            } else {
                for (let i = 0; i < data.length; i++) {
                    let row = data[i];
                    var htmlRow = grid.itemFor(row);
                    $(htmlRow).css({ "display": "table-row" });
                };
                grid.setOptions({ columns: grid.oldColumns })
            };
        });
    });
});
