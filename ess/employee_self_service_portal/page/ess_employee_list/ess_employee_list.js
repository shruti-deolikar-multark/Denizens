// frappe.pages['ess_employee_list'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'None',
// 		single_column: true
// 	});
// }

// frappe.pages['ess_employee_list'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'None',
// 		single_column: true
// 	});
// }

frappe.pages['ess_employee_list'].on_page_load = function(wrapper) {
    new ESS(wrapper);
    console.log(wrapper)
}

//Page content
ESS = Class.extend({
    init: function(wrapper){
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'Employee',
            single_column: true,
            with_dashboard: true
        });
        this.make()

		// show_employee_count_card(page);
		// show_new_hire_count(page);
		// show_employee_exit_count(page);  // Uncomment if needed
		// show_employee_join_count_this_quarter(page);  // Uncomment if needed
		// render_ess_dashboard(page);
        if(frappe.boot.employee){
            this.make_sidebar()
        }
        // else{
        //         let dialog = new frappe.ui.Dialog({
        //             title: __('Select Employee'),
        //             fields: [
        //                 {
        //                     fieldtype: 'Link',
        //                     fieldname: 'employee',
        //                     options: 'Employee',
        //                     label: __('Employee'),
                            
        //                 },

        //             ],
        //             primary_action_label: __('Go'),
        //             primary_action: (values) => {
        //                 console.log(values)
        //                 frappe.call({
        //                     'method': 'frappe.client.get_value',
        //                     args: {
        //                         'doctype': 'Employee',
        //                         'filters': {
        //                             'name': values.employee
        //                         },
        //                         'fieldname': ['department']
        //                     }
        //                 }).then(r => {
        //                     console.log(r.message)
        //                     frappe.boot.department = r.message['department']
        //                 });
        //                 dialog.hide();
        //                 frappe.boot.employee = values.employee
        //                 // frappe.boot.department = values.department
        //                 this.make_sidebar()
        //             }
        //         });
        //         dialog.show();
        // }
    },
    // bind event to all buttons on page
    bind_events: function() {
        // leave application links
		let btns = document.querySelectorAll('#leave_application');
        for (i of btns) {
            i.addEventListener('click', function() {
                // alert(this.value)
                frappe.model.with_doctype('Leave Application', () => {
                    // route to  Attendance
                    let leave_application = frappe.model.get_new_doc('Leave Application');
                    leave_application.leave_type = this.value
                    leave_application.employee = frappe.boot.employee
                    frappe.set_route('Form','Leave Application', leave_application.name);
                });
            })
        }
        // attendance
        let secondary_btns = document.querySelectorAll('#attendance_');
        for (i of secondary_btns) {
            i.addEventListener('click', function() {
                // alert(this.value)
                frappe.model.with_doctype('Attendance', () => {
                    // route to  Attendance
                    let attendance = frappe.model.get_new_doc('Attendance');
                    attendance.status = this.value
                    attendance.employee = frappe.boot.employee
                    frappe.set_route('Form','Attendance', attendance.name);
                });
            })
        }
	},

    // make page
    make: function(){
        // grab the class
        let me = $(this);
        // push dom element to page
        $(frappe.render_template("ess_employee_list",{})).appendTo(this.page.main)
    },

    get_balance_leaves: function(){
        frappe.call({
            method: "hrms.hr.doctype.leave_application.leave_application.get_leave_details",
            async: false,
            args: {
                employee:frappe.boot.employee ,
                date: frappe.datetime.get_today()
            },
            callback: function(r) {
                console.log(r.message)
                let find = document.querySelector('.leaves');
                let html = frappe.render_template("ess_table",{data:r.message['leave_allocation']});
                let div = document.createElement('div');
                div.innerHTML = html;
                find.appendChild(div);

                return r.message
            }
        });
        console.log(this)
        // this.leaveApplication()
    },

    // make sidebar
    make_sidebar: function(){
        // grab the class
        let me = $(this);
        console.log(me)
        console.log(this.page)
        // me.page.set_title("Hemml")
        // get employee details
        frappe.call({
            method:"ess.employee_self_service_portal.page.ess.ess.get_employee_details",
            args:{"employee":frappe.boot.employee}
        }).then(r => {
                console.log("Employee Details")
                console.log(r.message)
                // render sidebar
                // $(frappe.render_template("ess_sidebar",
                //                                         {
                //                                             "employee_name":r.message['employee_name'],
                //                                             "image":r.message['image']
                //                                         })).appendTo(this.page.sidebar)

                $(frappe.render_template("ess_employee_list",r.message)).appendTo(this.page.main)
                // this.page.set_title(r.message['employee_name'])
                // if(r.message['status']==="Active"){
                //     this.page.set_indicator('Active', 'green')
                // }else if(r.message['status']==="Inactive"){
                //     this.page.set_indicator('Inactive', 'orange')
                // }else if(r.message['status']==="Left"){
                //     this.page.set_indicator('Left', 'red')
                // }else {
                //     this.page.set_indicator('Unknown', 'gray')
                // }
                this.get_checkin()
                this.loadReport()
                this.loadLeaveAnalyticsReport()
                this.custom_checkin()
                // this.custom_checkout()
                // this.checkin()
                // this.checkout()
                setInterval(() => {
                    this.showTime()
                    frappe.datetime.refresh_when();
                }, 1000);
                // this.get_approvals_list()
                this.get_modules_and_reoports_list()
                this.get_balance_leaves()
                this.bind_events()
                this.get_holiday_list()
                this.get_employee_with_birthday_this_month()
                this.get_employee_on_leave_this_month()
                this.get_members_status_for_the_day()
                console.log("printing me")
                console.log(me)
                console.log(me.curr_month)
                this.get_location()

        })
    },
    // get members present aant on duty today
    get_members_status_for_the_day: function(){
        frappe.call({
            method: "ess.employee_self_service_portal.page.ess.ess.get_presenty",
            args:{
                "department":frappe.boot.department
            },
            async: false,
            callback: function(r) {
                console.log("Presenty Starts ---------------")
                console.log(r.message)
                if(r.message['members_present_today']){
                    let find_present = document.querySelector('.present-members');
                    let html = frappe.render_template('list',{'data':r.message['members_present_today']});
                    let div = document.createElement('div');
                    div.innerHTML = html;
                    find_present.appendChild(div);
                }
                if(r.message['members_absent_today']){
                    let find_absent = document.querySelector('.absent-members');
                    let html = frappe.render_template('list',{'data':r.message['members_absent_today']});
                    let div = document.createElement('div');
                    div.innerHTML = html;
                    find_absent.appendChild(div);
                }
                if(r.message['members_on_duty']){
                    let find_onduty = document.querySelector('.onduty-members');
                    let html = frappe.render_template('list',{'data':r.message['members_on_duty']});
                    let div = document.createElement('div');
                    div.innerHTML = html;
                    find_onduty.appendChild(div);
                }
                console.log("Presenty Ends ---------------")
            }
        });
    },
    // Get Modules and reports
    get_modules_and_reoports_list: function(){
        frappe.call({
            method: "ess.employee_self_service_portal.page.ess.ess.get_connections",
            async: false,
            args: {
                employee:frappe.boot.employee
            },
            callback: function(r) {
                console.log(r.message)
                var doctypes = []
                if(r.message[0]){
                    r.message[0].forEach(dt => {
                        if(frappe.model.can_read(dt)){
                            doctypes.push(dt)
                        }
                    })
                }
                let find = document.querySelector('.modules-reports');
                let html = frappe.render_template('ess_modules_reports',{'doctypes':doctypes,'reports':r.message[1]});
                let div = document.createElement('div');
                div.innerHTML = html;
                find.appendChild(div);
            }
        });
    },
    // Get Holiday List
    get_holiday_list: function(){
        frappe.call({
            method: "ess.employee_self_service_portal.page.ess.ess.holiday_for_month",
            async: false,
            args: {
                employee:frappe.boot.employee
            },
            callback: function(r) {
                console.log(r.message)
                frappe.render_template('ess_list',{'data':r.message})
                let find = document.querySelector('.holiday');
                let html = frappe.render_template('ess_list',{'data':r.message});
                let div = document.createElement('div');
                div.innerHTML = html;
                find.appendChild(div);
            }
        });
    },
    // Get Leave Balances
    get_balance_leaves: function(){
        frappe.call({
            method: "hrms.hr.doctype.leave_application.leave_application.get_leave_details",
            async: false,
            args: {
                employee:frappe.boot.employee ,
                date: frappe.datetime.get_today()
            },
            callback: function(r) {
                console.log(r.message)
                let find = document.querySelector('.leaves');
                let html = frappe.render_template("ess_table",{data:r.message['leave_allocation']});
                let div = document.createElement('div');
                div.innerHTML = html;
                find.appendChild(div);

                return r.message
            }
        });
        console.log(this)
        // this.leaveApplication()
    },
    // cheakin button action
    checkin: function(){
        document.querySelector('.checkin').addEventListener("click", function() {
            console.log("Checkin")
            frappe.call({
                method:"ess.employee_self_service_portal.page.ess.ess.checkin",
                args:{
                        "employee":frappe.boot.employee,
                        "log_type":"IN",
                        "longitude":localStorage.getItem("longitude"),
                        "lattitude":localStorage.getItem("lattitude"),
                        "components":localStorage.getItem("components"),
                    }
            }).then(r => {
                console.log(r)
                let find = document.querySelector('#in-attendance-text');
                let html = r.message;
                let div = document.createElement('div');
                div.innerHTML = html;
                find.appendChild(div);
                document.getElementById("checkin").disabled = true;
            })
          });
    },
    custom_checkin: function(){
        var now     = new Date();
        var year    = now.getFullYear();
        var month   = now.getMonth()+1;
        var day     = now.getDate();
        var hour    = ('0'+now.getHours()).slice(-2); //get hours with padding zero
        var minute  = ('0'+now.getMinutes()).slice(-2); // get minutes in padding zero
        var second  = ('0'+now.getSeconds()).slice(-2); // get sec in padding zero
        console.log('sec '+second);
        var result = now.toISOString().split('T')[0]; // date with padding zero

        console.log(result);

        var dateTime = result+' '+hour+':'+minute+':'+second;
        var tdy = result+ ' 09:10:00';
        var ext = result+ ' 18:00:00';
        var ext_out = '6:0 PM';
        console.log('ext out '+ext_out);
        var ty = result;
        var dt = new Date();
        console.log('DT '+ty);
        var h =  dt.getHours(), m = dt.getMinutes();
        var _time = (h > 12) ? (h-12 + ':' + m +' PM') : (h + ':' + m +' AM');
        console.log('_time '+_time);
        console.log('TIME '+dateTime);
        console.log('ADD '+tdy);
        console.log('ext '+ext);
        // bind event to checkin button
        document.querySelector('.checkin').addEventListener("click", function() {
            if (dateTime > tdy){
                    console.log('test');
                    let dialog = new frappe.ui.Dialog({
                        title: __("Enter Reason For Late Entry"),
                        fields: [
                            {
                                fieldname: 'employee',
                                label: __('Employee'),
                                fieldtype: 'Data',
                                default:frappe.boot.employee
                            },
                            {
                                fieldname: 'reason_late',
                                label: __('Reason For Late Entry'),
                                fieldtype: 'Small Text',
                            },
                            {
                                fieldname: 'sec_break_1',
                                fieldtype: 'Section Break',
                            },
                            {
                                fieldname: 'longitude',
                                label: __('Longitude'),
                                fieldtype: 'Read Only',
                                default:localStorage.getItem('longitude'),
                            },
                            {
                                fieldname: 'latitude',
                                label: __('Latitude'),
                                fieldtype: 'Read Only',
                                default:localStorage.getItem('latitude'),
                            },
                            {
                                fieldname: 'city',
                                label: __('City'),
                                fieldtype: 'Read Only',
                                default:localStorage.getItem('city'),
                            },
                            {
                                fieldname: 'state',
                                label: __('State'),
                                fieldtype: 'Read Only',
                                default:localStorage.getItem('state'),
                            }
                        ],
                        primary_action(data)  {
                            console.log(data)
                            console.log('nivedha '+data.reason_late);
                            if(!data.reason_late){console.log('reason'); frappe.throw('Reason For Late Entry is Mandatory.')}
                            frappe.call({
                                method: "ess.custom_methods.checkin_attendance_creation",
                                args: {
                                    data: data
                                },
                                callback: function(r) {
                                    console.log(r);
                                	if (r.message.status === 1) {
                                        frappe.msgprint({message: __("Good Morning, Have a Good Day!!!"), indicator: 'blue'});
                                        cur_dialog.hide();
                                	}else if (r.message.status ===0){
                                        frappe.msgprint({message: __(r.message.doc), indicator: 'red'});
                                    }
                                }
                            });
                           
                            dialog.hide();
                            window.location.reload();

                                },
                        primary_action_label: __('CheckIn')
                    });
                    dialog.show();
                }
                else if (dateTime < tdy) {
                    console.log('else if');
                    let d = new frappe.ui.Dialog({
                        title: 'Enter details',
                        fields: [
                            {
                                label: 'Work From Home',
                                fieldname: 'home',
                                fieldtype: 'Check'
                            },
                            {
                                fieldtype: 'Column Break'
                            },
                            {
                                label: 'Office',
                                fieldname: 'office',
                                fieldtype: 'Check'
                            }
                        ],
                        primary_action_label: 'Submit',
                        primary_action(data) {
                            console.log(data);
                            frappe.call({
                                method: "ess.custom_methods.checkin_attendance_creation",
                                args: {
                                    data: data
                                },
                                callback: function(r) {
                                    console.log(r);
                                    if (r.message.status === 1) {
                                        frappe.msgprint({message: __("Good Morning, Have a Good Day!!!"), indicator: 'blue'});
                                        cur_dialog.hide();
                                	}else if (r.message.status ===0){
                                        frappe.msgprint({message: __(r.message.doc), indicator: 'red'});
                                    }
                                    //if (r.message === 1) {
                                        // frappe.msgprint({message: __("Good Morning, Have a Good Day!!!"), indicator: 'blue'});
                                        // document.getElementById("checkin").disabled = true;
                                        // cur_dialog.hide();

                                }
                                }
                            );
                            d.hide();
                        }
                    });
                    d.show();
                    document.getElementById("checkin").disabled = true;
                }
                console.log("added checkin")
                $(this).get_checkin()

        })
        //bind event to checkout
        document.querySelector('.checkout').addEventListener("click", function() {
            console.log("Check Out")
            if (_time < ext_out){
                console.log('test');
                let dialog = new frappe.ui.Dialog({
                title: __("Enter Reason For Early Exit"),
                fields: [
                    {
                        fieldname: 'reason_exit',
                        label: __('Reason For Early Exit'),
                        fieldtype: 'Small Text',
                    },
                ],

                primary_action(data)  {
                    if(!data.reason_exit){console.log('reason'); frappe.throw('Reason For Early Exit is Mandatory.')}
                        frappe.call({
                            method: "ess.custom_methods.checkout_creation",
                            args: {
                                data: data
                            },
                            callback: function(r) {
                                if (r.message === 1) {
                                    frappe.msgprint({message: __("Thank You!!!"), indicator: 'blue'});
                                    cur_dialog.hide();
                                    this.get_checkin()
                                }
                            }
                        });
                        dialog.hide();
                },
                primary_action_label: __('CheckOut')
            });
            dialog.show();
        }
        else if (_time >= ext_out) {
            console.log('else if');
            let d = new frappe.ui.Dialog({
                title: 'Enter details',
                fields: [
                    {
                        label: 'Work From Home',
                        fieldname: 'home',
                        fieldtype: 'Check'
                    },
                    {
                        fieldtype: 'Column Break'
                    },
                    {
                        label: 'Office',
                        fieldname: 'office',
                        fieldtype: 'Check'
                    }
                ],
                primary_action_label: 'Submit',
                primary_action(data) {
                    console.log(data);
                    frappe.call({
                        method: "ess.custom_methods.checkout_creation",
                        args: {
                            data: data
                        },
                        callback: function(r) {
                            if (r.message === 1) {
                                frappe.msgprint({message: __("Thank You!!!"), indicator: 'blue'});
                                cur_dialog.hide();
                                document.getElementById("checkout").disabled = true;
                                this.get_checkin()
                            }
                            //if (r.message === 1) {
                                // frappe.msgprint({message: __("Thank You!!!"), indicator: 'blue'});
                                // cur_dialog.hide();
                            //}
                        }
                    });
                    d.hide();
                }
            });
            document.getElementById("checkout").disabled = true;
        }
    });
    },
    // get checkin and checkout
    get_checkin: function(){
        console.log("getting checkin")
        frappe.call({
            method:"ess.employee_self_service_portal.page.ess.ess.get_checkin",
            args:{"employee":frappe.boot.employee}
        }).then(r => {
            console.log(r.message)
            if(r.message['checkin_count']>0 || r.message['checkout_count']>0 ){
                console.log('checkin')
                console.log(r.message['checkin'])
                if (r.message['checkin'].length > 0){
                    document.getElementById("checkin").disabled = true;
                }
                if (r.message['checkout'].length > 0){
                    document.getElementById("checkout").disabled = true;
                }
                if (r.message['checkin']){
                    let find = document.querySelector('#in-attendance-text');
                    let html = ''//'<b>Checkin</b>'
                    r.message['checkin'].forEach(element => {
                        html+="<br>"+element['name']
                    });
                    let div = document.createElement('div');
                    div.innerHTML = html;
                    div.style="color:green"
                    find.appendChild(div);
                }
                if(r.message['checkout']){
                    let find = document.querySelector('#out-attendance-text');
                    let html = ''//'<b>Checkout</b>'
                    r.message['checkout'].forEach(element => {
                        html+="<br>"+element['name']
                    });
                    let div = document.createElement('div');
                    div.innerHTML = html;
                    div.style="color:red"
                    find.appendChild(div);
                }
                console.log('checkout')
                console.log(r.message['checkout'])
            }
            else{
                frappe.msgprint("You Have not Checked In Yet.")
                // alert("Not Checked In Yet!!!")
                // frappe.confirm(
                //     'You have not yet checked ',
                //     function(){
                //         frappe.call({
                //             method:"ess.employee_self_service_portal.page.ess.ess.checkin",
                //             args:{"employee":frappe.boot.employee,"log_type":"IN"}
                //         }).then(r => {
                //             console.log(r)
                //             let find = document.querySelector('#attendance-text');
                //             let html = r.message;
                //             let div = document.createElement('div');
                //             div.innerHTML = html;
                //             find.appendChild(div);
                //             document.getElementById("checkin").disabled = true;
                //         })
                //         window.close();
                //     },
                //     function(){
                //         show_alert('Welcome' + frappe.session.user + ' to ESS Portal!')
                //     }
                // )
            }

        })
    },
    // get_employee_with_birthday_this_month
    get_employee_with_birthday_this_month: function(){
        frappe.call({
            method:"ess.employee_self_service_portal.page.ess.ess.get_employee_with_birthday_this_month"
        }).then(r => {
            let find = document.querySelector('.birthday');
            let html = frappe.render_template('birthday',{'data':r.message});
            let div = document.createElement('div');
            div.innerHTML = html;
            find.appendChild(div);
        })
    },
    // get_employee_on_leave_this_month
    get_employee_on_leave_this_month: function(){
        console.log("in here .....")
        frappe.call({
            method:"ess.employee_self_service_portal.page.ess.ess.get_employee_on_leave_this_month",
            args:{'department':frappe.boot.department},
        }).then(r => {
            console.log("Leave Section")
            console.log(r.message)
            let find = document.querySelector('.onleave');
            let html = frappe.render_template('leave',{'leave_data':r.message[0],'absent_data':r.message[1]});
            let div = document.createElement('div');
            div.innerHTML = html;
            find.appendChild(div);
        })
    },
    // approvals list
    get_approvals_list: function(){
        console.log("appr")
        // frappe.call({
        //     method:"ess.employee_self_service_portal.page.ess.ess.get_approval_doc"
        //     }).then(r => {console.log(r)
        //     let find = document.querySelector('.approvals');
        //         template = `
        //         <button type="button" class="btn btn-danger" href="#/apps/{%= key %}">
        //         {{ key }} <span class="badge badge-light">{{ value}}</span>
        //                         <span class="sr-only">unread messages</span>
        //                     </button>`
        //         let html =''
        //         for (const [key, value] of Object.entries(r.message)) {
        //         console.log(key, value);
        //         html + =  frappe.render_template(template,({%= key %}, {%= value %}))

        //         }
        //         let div = document.createElement('div');
        //         div.innerHTML = html;
        //         div.onclick = function(){
        //             frappe.route_options = {
        //                 "status": "Open"
        //             };
        //             frappe.set_route("Form", "Leave Application");
        //             }
        //         find.appendChild(div);
        //     });

    },
    // timer function
    showTime: function(){

        document.getElementById("date").innerText = frappe.datetime.get_datetime_as_string();
        document.getElementById("date").textContent = frappe.datetime.get_datetime_as_string();

        // setTimeout(showTime, 1000);
    },
    // render report
    loadReport: function(){
        frappe.call({
            method: "frappe.desk.query_report.run",
            async: false,
            args: {
                report_name:'Total Working Hours',
                filters:{'employee':frappe.boot.employee}
            }
        }).then(r => {
            console.log('Report')
            console.log(r.message.result)
            console.log(r)
            // columns = []
            const columns = r.message.columns.map(item => {
                return { id: item.fieldname, name: item.label };
              });
            // r.message.columns.forEach(col => {columns.push(col.label)})
            console.log('Coulmns')
            console.log(columns)
            // var res = []
            const res = r.message.result.map(item => {
                return { id: item.fieldname, name: item.label };
              });
            r.message.result.forEach(c => {

            if(typeof c === 'object') {
                console.log(Object.values(c))
                res.push({"name":Object.values(c),"resizable":false, "width": 2,})
                }
            else{
                res.push(c)
            }
            console.log("print res")
            console.log(res)
            })
            const datatable_options = {
                columns: columns,
                data: r.message.result,
                layout:'fluid',
                noDataMessage: "no data available"
            };
            if (r.message.result){
                datatable = new frappe.DataTable('.report-container',datatable_options);
            }else{
                document.getElementById("attendance_report_section").style.display ="none"
            }

        })
    },
    loadLeaveAnalyticsReport: function(){
        frappe.call({
            method: "frappe.desk.query_report.run",
            async: false,
            args: {
                report_name:'Leave Analytics',
                filters:{'employee':frappe.boot.employee}
            }
        }).then(r => {
            console.log('Report')
            console.log(r.message.result)
            console.log(r)
            // columns = []
            const columns = r.message.columns.map(item => {
                return { id: item.fieldname, name: item.label };
              });
            // r.message.columns.forEach(col => {columns.push(col.label)})
            console.log('Coulmns')
            console.log(columns)
            // var res = []
            const res = r.message.result.map(item => {
                return { id: item.fieldname, name: item.label };
              });
            r.message.result.forEach(c => {

            if(typeof c === 'object') {
                console.log(Object.values(c))
                res.push({"name":Object.values(c),"resizable":false, "width": 2,})
                }
            else{
                res.push(c)
            }
            console.log("print res")
            console.log(res)
            })
            const datatable_options = {
                columns: columns,
                data: r.message.result,
                layout:'fixed',
                noDataMessage: 'no data available'
            };
            datatable = new frappe.DataTable('.leave-report-container',
            datatable_options
            );

        })
    },
    // location 
    onPositionRecieved:function(position){
        // alert(position.coords.longitude)
        var longitude = position.coords.longitude;
        var latitude = position.coords.latitude;
        let locationData = {}
        localStorage.setItem('longitude', longitude);
        localStorage.setItem('latitude', latitude);
        console.log(longitude);
        console.log(latitude);
        fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
            .then(response => response.json())
            .then(data => {
                locationData = data['results'][0].components
                var city = data['results'][0].components.city;
                var state = data['results'][0].components.state;
                var area = data['results'][0].components.residential;
                localStorage.setItem('city', city);
                localStorage.setItem('state', state);
                localStorage.setItem('area', area);
                localStorage.setItem('components', JSON.stringify(data['results'][0].components));
                console.log(data);
                document.getElementById('locationFrame').src = 'https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed'
            })
            locationData = localStorage.getItem("components")
            localStorage.setItem('locationData', JSON.stringify(locationData));
            locationData.longitude = longitude
            locationData.latitude = latitude
            .catch(err => console.log(err));
            document.getElementById('locationFrame').src = 'https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed'

    },

    locationNotRecieved:function(positionError) {
        console.log(positionError);
    },
    get_location:function(){
        console.log("fetching location")
        navigator.geolocation.getCurrentPosition(this.onPositionRecieved,this.locationNotRecieved,{ enableHighAccuracy: true});
        console.log("fetching location Done..")
    },
})

function openEmployeeForm() {
    // Open the ERPNext Employee form URL
    window.location.href = 'http://127.0.0.1:8000/app/employee/new-employee'; // Modify this URL based on your ERPNext setup
  }

  function navigateToEmployee(employeeName) {
    // Construct the URL for the employee
    const url = `/app/employee/${employeeName}`;
    
    // Redirect to the URL
    window.location.href = url;
}


// pop up form depricated
        // for (i of btns) {
        // i.addEventListener('click', function(me) {
        //     console.log(this.value);
        //     console.log(me);
        //     // leave application dialog

		// let edit_profile_dialog = new frappe.ui.Dialog({
		// 	title: __('Leave Application'),
		// 	fields: [
        //         {
		// 			fieldtype: 'Link',
		// 			fieldname: 'employee',
		// 			label: 'Employee',
        //             options: 'Employee',
        //             default:this.employee
		// 		},
        //         {
        //             fieldtype: 'Date',
        //             fieldname: 'from_date',
        //             label: 'From Date'
        //         },
		// 		{
        //             fieldtype: 'Column Break'
		// 		},
        //         {
        //             fieldtype: 'Link',
        //             fieldname: 'leave_type',
        //             label: 'Leave Type',
        //             options: 'Leave Type',
        //             default: this.value
        //         },
		// 		{
		// 			fieldtype: 'Date',
		// 			fieldname: 'to_date',
		// 			label: 'To Date',
		// 		},
		// 		{
		// 			fieldtype: 'Section Break',
		// 			fieldname: 'Approver',
		// 		},
        //         {
		// 			fieldtype: 'Link',
		// 			fieldname: 'approver',
		// 			label: 'Approver',
        //             options: 'Employee'
		// 		},
        //         {
		// 			fieldtype: 'Small Text',
		// 			fieldname: 'description',
		// 			label: 'Reason'
		// 		},

		// 	],
		// 	primary_action: values => {
		// 		edit_profile_dialog.disable_primary_action();
		// 		frappe.xcall('ess.employee_self_service_portal.page.ess.ess.create_leave_application', {
		// 			info: values
		// 		}).then(r => {
		// 			console.log(r.message)
		// 		}).finally(() => {
		// 			edit_profile_dialog.hide();
		// 		});
		// 	},
		// 	primary_action_label: __('Save')
		// });

		// edit_profile_dialog.set_values({
		// 	employee: frappe.boot.employee,
		// });
		// edit_profile_dialog.show();
        // });
        // }

        


          function openEmployeeForm() {
            window.location.href = "http://127.0.0.1:8000/app/employee/new-employee";
          }
// Function to fetch employees from the backend
async function fetchEmployees() {
    try {
      const response = await fetch('/app/employee'); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const employees = await response.json();
  
      // Call function to populate the table with employee data
      populateEmployeeTable(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }
  
  // Function to populate the employee table
  function populateEmployeeTable(employees) {
    const tableBody = document.getElementById('employee-list');
  
    // Clear any existing rows
    tableBody.innerHTML = '';
  
    // Add a row for each employee
    employees.forEach(employee => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${employee.name}
       ${employee.email}</td>
        <td>${employee.department}</td>
        <td>${employee.branch}</td>
        <td> ${employee.cell_number && employee.cell_number.trim() !== "" 
      ? `<span class="employee-contact">${employee.cell_number}</span>` 
      : `<button class="add-contact-btn" onclick="openContactForm('${employee.name}')">Add Contact</button>`}</td>
      `;
      row.onclick = () => {
        // Navigate to the employee detail page
        window.location.href = `/app/employee/${employeeData.data.name}`;
    };
      tableBody.appendChild(row);
    });
  }
  

  // Function to redirect after saving a new employee
// async function redirectAfterSave() {
//     // Check if the URL matches the new employee form
//     if (window.location.href.includes("new-employee")) {
//       // Observe the DOM to detect the Save button dynamically
//       const observer = new MutationObserver(() => {
//         const saveButton = document.querySelector('button[title="Save"]');
//         if (saveButton) {
//           // Attach click event to the Save button
//           saveButton.addEventListener("click", () => {
//             // Wait for the save operation to complete and redirect
//             setTimeout(() => {
//               window.location.href = "http://127.0.0.1:8000/app/ess_employee_list";
//             }, 2000); // Adjust delay to allow save operation to complete
//           });
  
//           // Stop observing once the button is found
//           observer.disconnect();
//         }
//       });
  
//       // Observe the body for changes to detect the Save button
//       observer.observe(document.body, { childList: true, subtree: true });
//     }
//   }
  
//   // Call the redirect function on page load
//   redirectAfterSave();
  
async function redirectAfterSave() {
    // Check if the URL matches the new employee form (dynamically includes the ID part)
    if (window.location.href.includes("new-employee")) {
      // Wait for the page to fully load
      window.addEventListener("load", () => {
        const saveButton = document.querySelector('button[title="Save"]');
        
        if (saveButton) {
          // Attach click event to the Save button
          saveButton.addEventListener("click", () => {
            // Add logging to see if the button click is being registered
            console.log("Save button clicked. Waiting for redirect...");
  
            // Use a setTimeout to give the save operation time to complete before redirect
            setTimeout(() => {
              // Log the redirect action
              console.log("Redirecting to ess_employee_list...");
  
              // Redirect to the desired URL after saving
              window.location.href = "/app/ess_employee_list";
            }, 2000); // Adjust the delay as needed (2 seconds)
          });
        }
      });
    }
  }
  
  // Call the redirect function on page load
  redirectAfterSave();
  

//   function shiftUnderline(element) {
//     // Remove the 'active' class from all items
//     const items = document.querySelectorAll('.list-item');
//     items.forEach(item => item.classList.remove('active'));
  
//     // Add 'active' class to the clicked item
//     element.classList.add('active');
  
//     // Move the underline to the clicked item
//     const underline = document.querySelector('.underline');
  
//     // Get the bounding box of the clicked item
//     const itemPosition = element.getBoundingClientRect();
  
//     // Get the bounding box of the parent container (list header)
//     const containerPosition = element.parentElement.getBoundingClientRect();
  
//     // Adjust the width and position of the underline
//     underline.style.width = `${itemPosition.width}px`; // Correct usage of template literal
//     underline.style.left = `${itemPosition.left - containerPosition.left}px`; // Correct usage of template literal
    
//   }
  
  
  // Function to fetch and populate employee data
  async function fetchEmployeeData() {
    const apiUrl = "http://127.0.0.1:8000/api/resource/Employee";
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.data) {
        const employeeList = document.getElementById("employee-list");
        employeeList.innerHTML = ""; // Clear existing rows
  
        for (const employee of data.data) {
          const employeeDetails = await fetch(`${apiUrl}/${employee.name}`);
          const employeeData = await employeeDetails.json();
  
          const row = document.createElement("tr");
          row.innerHTML = `                <tr>
    
<div class="profile-details">
    <div class="profile-image-container">
        ${profileImage || '<div class="placeholder-image"></div>'}
    </div>
    <div class="employee-info">
        <span class="employee-name">${employee.employee_name || "N/A"}</span><br>
        <span class="employee-email">${employee.personal_email || ""}</span>
    </div>
</div>


                        <td>${employee.department || "N/A"}</td>
                        <td>${employee.branch || "N/A"}</td>
                        <td> ${employee.department || "N/A"}</td>
<td>
${employee && employee.cell_number 
    ? `<span class="employee-contact">${employee.cell_number}</span>` 
    : `<button class="add-contact-btn" onclick="navigateToEmployee('${employee.name}')">Add Contact</button>`}
</td>

                        <td>
                         <a href="/app/employee/${employee.name}">
                          <img src="/files/fluent_eye-12-filled.png" style="width: 20px; height: 20px; margin-right: 8px; cursor: pointer;">
                          </a>
                          <a href="/app/employee/${employee.name}">
                            <img src="/files/fluent_edit-12-regular.png" style="width: 20px; height: 20px; margin-right: 8px; cursor: pointer;">
                          </a>
    <img src="/files/fluent_delete-12-regular.png" style="width: 20px; height: 20px; cursor: pointer;" 
         onclick="deleteRow(this)" />
                        </td>
                        <td></td>
                      </tr>

`
row.onclick = () => {
    // Navigate to the employee detail page
    window.location.href = `/app/employee/${employeeData.data.name}`;
};
          employeeList.appendChild(row);
        }
      } else {
        console.error("No employee data found");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  }
  
  // Call the function to fetch employee data
  fetchEmployeeData();
  


function fetchEmployees(state, element) {
    // Highlight the active filter
    document.querySelectorAll('.list-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
  
    // Update underline position (optional visual effect)
    const underline = document.querySelector('.underline');
    underline.style.width = `${element.offsetWidth}px`;
    underline.style.left = `${element.offsetLeft}px`;
  
    // Display a loading message
    const container = document.getElementById('employee-list');
    container.innerHTML = "<p>Loading...</p>";
  
    // Define filters based on the selected category
    let filters = {};
    if (state === 'Pending') {
      filters.state = 'Pending';
    }
  
    // Fetch employees
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Employee",
        filters: filters,
        fields: ["name", "employee_name", "state"],
      },
      callback: function(response) {
        const employees = response.message;
        if (employees && employees.length > 0) {
          let html = `<h4>${state === 'all' ? "All Employees" : "Inactive Employees"}</h4><ul>`;
          employees.forEach(employee => {
            html += `<li>${employee.employee_name} (${employee.state})</li>`;
          });
          html += "</ul>";
          container.innerHTML = html;
        } else {
          container.innerHTML = "<p>No employees found for the selected category.</p>";
        }
      },
      error: function() {
        container.innerHTML = "<p>Failed to fetch data. Please try again.</p>";
      }
    });
  }

  function shiftUnderline(element) {
    // Highlight the active filter
    const listItems = document.querySelectorAll(".list-item");
    listItems.forEach((item) => item.classList.remove("active"));
    element.classList.add("active");

    // Get the underline element
    const underline = document.querySelector('.underline');

    if (underline) {
        // Calculate the new position of the underline
        underline.style.width = `${element.offsetWidth}px`;
        underline.style.left = `${element.offsetLeft}px`;
    }

    // Determine the selected filter
    const filter = element.innerText;

    // Reference the table body to update the displayed employees
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

    // Define filters for each category
    let filters = {};

    if (filter === "ARCHIVE") {
        filters = { state: "Archive" }; // Apply filter for inactive employees
    } else {
        filters = {}; // Default filter to show all employees when no specific filter is selected
    }

    if (filter === "PENDING") {
        // Only show inactive employees when the "PENDING" filter is selected
        filters = { state: "Pending" }; // Apply filter for inactive employees
    } else {
        filters = {}; // Default filter to show all employees when no specific filter is selected
    }
    if (filter === "SPONSORED") {
        // Only show inactive employees when the "PENDING" filter is selected
        filters = { state: "Sponsored" }; // Apply filter for inactive employees
    } else {
        filters = {}; // Default filter to show all employees when no specific filter is selected
    }

   // Fetch data based on filters for non-"ARCHIVE" or "SPONSORED"
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Employee",
            filters: filters,
            fields: ["name", "employee_name", "personal_email", "department", "branch", "image", "state","cell_number"],
        },
        
        callback: function (response) {
            const employees = response.message;
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Clear previous rows
            console.log("employees:- outside consition",employees) 
            if (employees && employees.length > 0) {
                employees.forEach((employee) => {
                    console.log("employees:-",employee)
                    // Skip inactive employees for the "PENDING" filter
                    if (filter === "PENDING" && employee.state !== "Pending") {
                        return;
                    }
                    if (filter === "ARCHIVE" && employee.state !== "Archive") {
                        return;
                    }
                    if (filter === "SPONSORED" && employee.state !== "Sponsored") {
                        return;
                    }
                    const profileImage = employee.image 
                    ? `<div class="profile-circle">
                         <img src="${employee.image}" alt="Profile Image" class="profile-image">
                       </div>` 
                    : '';
                  
                  // Create a new row
                  const row = document.createElement('tr');
                  row.innerHTML = `
                    <td>
    
                        <div class="profile-details">
                            <div class="profile-image-container">
                                ${profileImage || '<div class="placeholder-image"></div>'}
                            </div>
                            <div class="employee-info">
                                <span class="employee-name">${employee.employee_name || "N/A"}</span><br>
                                <span class="employee-email">${employee.personal_email || ""}</span>
                            </div>
                        </div>


                    </td>
                    <td>${employee.department || "N/A"}</td>
                    <td>${employee.branch || "N/A"}</td>
               
                    <!-- Display Contact Number or Add Contact Button -->
<td>
${employee && employee.cell_number 
    ? `<span class="employee-contact">${employee.cell_number}</span>` 
    : `<button class="add-contact-btn" onclick="navigateToEmployee('${employee.name}')">Add Contact</button>`}
</td>

                  
                    <td>
                      <a href="/app/employee/${employee.name}">
                        <img src="/files/fluent_eye-12-filled.png" style="width: 20px; height: 20px; margin-right: 8px; cursor: pointer;"/>
                      </a>
                      <a href="/app/employee/${employee.name}">
                        <img src="/files/fluent_edit-12-regular.png" style="width: 20px; height: 20px; margin-right: 8px; cursor: pointer;">
                      </a>
<img src="/files/fluent_delete-12-regular.png" style="width: 20px; height: 20px; cursor: pointer;" 
         onclick="deleteRow(this)" />
                    </td>
                    <td></td>
                  `;
                  
                  tableBody.appendChild(row); // Append the new row to the table body
                  
                });
            } else {
                tableBody.innerHTML = "<tr><td colspan='6'>No employees found.</td></tr>";
            }
        },
        error: function () {
            tableBody.innerHTML = "<tr><td colspan='6'>Failed to fetch data. Please try again.</td></tr>";
        },
    });
}


// Function to delete a row with confirmation
function deleteRow(rowElement) {
    // Show confirmation popup
    const confirmDelete = confirm("Are you sure you want to delete this row?");
    if (confirmDelete) {
      // If confirmed, delete the row
      rowElement.closest('tr').remove();
      // Optionally, make a backend call to delete the data if needed
      console.log("Row deleted!");
    } else {
      console.log("Row deletion canceled.");
    }
  }
  



  function show_employee_count_card() {
    // Render HTML template and append to the page
    // $(frappe.render_template("dashboardpage")).appendTo(page.main);

    // Fetch employee count from backend
    frappe.call({
        method: 'ess.employee_self_service_portal.page.ess_employee_list.ess_employee_list.get_total_employee_count',
        callback: function(response) {
            console.log("RESPONSE",response)
            if (response.message) {
                $('#employee_count').html(`
                    <span class="employee-count-number">${response.message}</span>
                `);
            } else {
                $('#employee_count').html(`<div>Error fetching employee count</div>`);
            }
        }
    });
}

function show_new_hire_count(page) {
    // Fetch the count of new hires (last 30 days)
    frappe.call({
        method: 'ess.employee_self_service_portal.page.ess_employee_list.ess_employee_list.get_total_new_hires',
        args: { days: 30 },  // Pass the number of days for filtering
        callback: function(response) {
            if (response.message) {
                $('#new_hire_count').html(`
                    <span class="employee-count-number">${response.message}</span>
                `);
            } else {
                $('#new_hire_count').html(`<div>Error fetching new hire count</div>`);
            }
        }
    });
}

function show_employee_exit_count() {
    // Skip the function execution if data is already loaded
    if ($('#employee_exit_count_year').data('loaded') === true) {
        return;
    }

    // Call to fetch employee exit count for the current year
	frappe.call({
		method: 'ess.employee_self_service_portal.page.ess_employee_list.ess_employee_list.get_employee_exit_count',
		args: { year: 2024 },  // Pass year or leave it to use the current year
		callback: function(response) {
			console.log("Response from server:55555555555555", response);
	
			if (response.message !== undefined) {
				// If the response message is 0, it's a valid count, not an error
				if (response.message === 0) {
					$('#employee_exit_count_year').html(`
						<span class="employee-count-number">0</span>
					`);
				} else {
					$('#employee_exit_count_year').html(`
						<span class="employee-count-number">${response.message}</span>
					`);
				}
			} else if (response.error) {
				$('#employee_exit_count_year').html(`<div>${response.error}</div>`);
			} else {
				$('#employee_exit_count_year').html(`<div>Unknown error occurred.</div>`);
			}
		}
	});
	
}

function show_employee_missing_contact_count() {
    frappe.call({
        method: 'ess.employee_self_service_portal.page.ess_employee_list.ess_employee_list.get_employee_missing_contact_count',
        callback: function(response) {
            console.log("Response from server:-------------", response);

            if (response.message !== undefined) {
                $('#missing_contact_count').html(`
                    <span class="employee-count-number">${response.message}</span>
                `);
            } else if (response.error) {
                $('#missing_contact_count').html(`<div>${response.error}</div>`);
            } else {
                $('#missing_contact_count').html(`<div>Unknown error occurred.</div>`);
            }
        }
    });
}

// Call the function to fetch and display the missing contact count
$(document).ready(function() {
    show_employee_missing_contact_count();
});


function show_employee_join_count_this_quarter(page) {
    // Ensure this function runs only once per page load to avoid infinite loop
    if ($('#employee_join_count_quarter').data('loaded') === true) {
        return; // Skip if data is already loaded
    }

    // Fetch employee join count (this quarter)
    frappe.call({
        method: 'ess.employee_self_service_portal.page.ess_employee_list.ess_employee_list.get_employee_join_count_this_quarter',
        callback: function(response) {
            if (response.message) {
                $('#employee_join_count_quarter').html(`
                    <span class="employee-count-number">${response.message}</span>
                    <div>Employees Joining (This Quarter)</div>
                `);
                $('#employee_join_count_quarter').data('loaded', true); // Mark data as loaded
            } else {
                $('#employee_join_count_quarter').html(`<div>Error fetching employee join count</div>`);
            }
        }
    });
}


function show_employee_expiry_count_within_60_days() {
    frappe.call({
        method: 'ess.employee_self_service_portal.page.ess_employee_list.ess_employee_list.get_employee_expiry_count_within_60_days',
        callback: function(response) {
            // console.log("Response from server:", response);

            if (response.message !== undefined) {
                $('#expiry_count_60_days').html(`
                    <span class="employee-count-number">${response.message}</span>
                `);
            } else if (response.error) {
                $('#expiry_count_60_days').html(`<div>${response.error}</div>`);
            } else {
                $('#expiry_count_60_days').html(`<div>Unknown error occurred.</div>`);
            }
        }
    });
}

// Call the function to fetch and display the expiry count
$(document).ready(function() {
    show_employee_expiry_count_within_60_days();
    show_employee_count_card();
    show_employee_exit_count();
});
