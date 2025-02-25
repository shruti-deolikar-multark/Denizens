// frappe.pages['ess_dummy'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'My Page',
// 		single_column: true
// 	});
// }


frappe.pages['ess_dummy'].on_page_load = function(wrapper) {
    new ESS(wrapper);
    // console.log(wrapper)
    document.addEventListener('DOMContentLoaded', function() {
        const sidebarElement = document.querySelector('.sidebar_elements');
        if (sidebarElement) {
            sidebarElement.classList.add('active');
        }
    });
}

//Page content
ESS = Class.extend({
init: function(wrapper) {
    this.page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Employee Details',
        single_column: true,
        with_dashboard: true
    });

    if (frappe.boot.employee) {
        this.make_sidebar();
        this.get_employee_education();
    } else {
        let dialog = new frappe.ui.Dialog({
            title: __('Select Employee'),
            fields: [
                {
                    fieldtype: 'Link',
                    fieldname: 'employee',
                    options: 'Employee',
                    label: __('Employee')
                }
            ],
            primary_action_label: __('Go'),
            primary_action: (values) => {
                console.log(values);

                // Fetch department using get_value for employee
                frappe.call({
                    'method': 'frappe.client.get_value',
                    args: {
                        'doctype': 'Employee',
                        'filters': {
                            'name': values.employee
                        },
                        'fieldname': ['department']
                    }
                }).then(r => {
                    console.log("response from employee details>>>>>>", r.message);
                    frappe.boot.department = r.message['department'];

                    // Fetch employee data (including education) using the custom method
                    frappe.call({
                        'method': 'ess.employee_self_service_portal.page.ess_dummy.ess_dummy.get_employee_data',  // Replace with your method's full path
                        args: {
                            'employee_name': values.employee
                        },
                        callback: (res) => {
                            if (res.message) {
                                // Get the education child table data
                                let education = res.message.education || [];
                                console.log("Education:", education);

                                // You can now store it in frappe.boot or use it as needed
                                frappe.boot.education = education;
                                // $(frappe.render_template("ess_body", { employee: res.message })).appendTo(this.page.main);

                                // Update the UI or call make_sidebar
                                this.make_sidebar();
                            }
                        }
                    });
                });

                dialog.hide();
                frappe.boot.employee = values.employee;
                console.log("EMPLOYEE data",frappe.boot.employee);
                
            }
        });
        dialog.show();
    }
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
        $(frappe.render_template("ess_body",{})).appendTo(this.page.main)
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
            method:"ess.employee_self_service_portal.page.ess_dummy.ess_dummy.get_employee_details",
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

                $(frappe.render_template("ess_body",r.message)).appendTo(this.page.main)
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
                method:"ess.employee_self_service_portal.page.ess_dummy.ess_dummy.checkin",
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
            method:"ess.employee_self_service_portal.page.ess_dummy.ess_dummy.get_checkin",
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
            method:"ess.employee_self_service_portal.page.ess_dummy.ess_dummy.get_employee_on_leave_this_month",
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

//     get_employee_education: function() {console.log("i'm triggered");
    

//         const employee_id = frappe.boot.employee;
    
//         // if (!employee_id) {
//         //     frappe.msgprint(__('Please select an employee first.'));
//         //     return;
//         // }
    
//         // API call to fetch education data
//     //     frappe.call({
//     //         method: "ess.employee_self_service_portal.page.ess.ess.get_employee_education", // Replace with your actual app and method path
//     //         args: {
//     //             employee_id: frappe.name
//     //         },
//     //         callback: (response) => {
//     //             const education = response.message || [];
//     //             this.render_education_table(education);
//     //         }
//     //     });
//     // },

//    const res= fetch("http://127.0.0.1:8000/api/resource/Employee/HR-EMP-00001")

//    console.log("Response>>>>> From Rest API",res)},
   


})



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
