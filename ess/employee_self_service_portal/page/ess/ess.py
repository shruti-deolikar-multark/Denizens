import frappe, json
from frappe.utils import get_link_to_form, now_datetime, nowdate, get_first_day, get_last_day
from frappe import _
from hrms.hr.doctype.upload_attendance.upload_attendance import get_active_employees

month_list = ['January','February','March','April','May','June','July','August','September','October','November','December']

@frappe.whitelist()
def get_employee_details(employee):
    if frappe.db.exists("Employee",employee):
        emp_details = frappe.db.sql('''select * from `tabEmployee` where name =%s ''',employee,as_dict=True)[0]
        print("emp_details------------------------------------", emp_details)
        emp_details['current_month'] = month_list[frappe.utils.get_datetime().month -1]
        print("emp_details['current_month'] =======================", emp_details['current_month'])
    # format dates
        if emp_details['date_of_birth']:
            emp_details['date_of_birth'] = frappe.format(emp_details['date_of_birth'])
        if emp_details['date_of_joining']:
            emp_details['date_of_joining'] = frappe.format(emp_details['date_of_joining'])
        # get employee leave balances
        # get holidays for this month
        emp_details.is_hr = frappe.db.get_value("Designation",emp_details.designation,'hr')
        if emp_details.is_hr:
            emp_details.admin_section = get_hr_admin_data()
        emp_details.connections, emp_details.reports = get_connections(employee)
        emp_details.approvals = get_approval_doc()
        return emp_details
    else:
        return []


@frappe.whitelist()
def get_connections(employee):
    connections = []
    reports = []
    _connections = frappe.db.get_all('Global Search DocType',filters={'parent':'ESS Portal Setting'},fields=['document_type','idx'])
    _reports = frappe.db.get_all('Report Link',filters={'parent':'ESS Portal Setting'},fields=['report','idx'])
    if _connections:
        sortes_connections = sorted(_connections, key=lambda d: d['idx'])
        connections = [list(x.values())[0] for x in sortes_connections]
    if _reports:
        sortes_reports = sorted(_reports, key=lambda d: d['idx'])
        reports = [list(x.values())[0] for x in _reports]
    return connections, reports

@frappe.whitelist()
def checkin(employee,log_type,longitude=None,lattitude=None,components=None):
    checkin_doc = frappe.new_doc("Employee Checkin")
    checkin_doc.employee = employee
    checkin_doc.log_type = log_type
    checkin_doc.time = now_datetime()
    checkin_doc_meta = frappe.get_meta("Employee Checkin")
    if checkin_doc_meta.get_field('longitude') and longitude:
        checkin_doc.longitude = longitude
    if checkin_doc_meta.get_field("latitude") and latitude:
        checkin_doc.lattitude = lattitude
    if isinstance(components, str):
        components = json.loads(components)
    for key,value in components.items():
        if checkin_doc_meta.get_field(key):
            checkin_doc.key = value
    try:
        checkin_doc.insert()
        checkin_link = get_link_to_form("Employee Checkin",checkin_doc.name)
        frappe.msgprint("{0} Created".format(checkin_link))
        return checkin_link
    except:
        error_log = frappe.log_error(frappe.get_traceback())
        error_log_link = get_link_to_form("Error Log",error_log.name)
        frappe.msgprint("{0} Created".format(error_log_link))
        return error_log_link

@frappe.whitelist()
def holiday_for_month(employee):
    holiday_list = frappe.db.get_value("Employee",employee,"holiday_list")
    month_first_date = get_first_day(nowdate())
    month_last_date = get_last_day(nowdate())
    frappe.db.get_value("Employee",employee,"holiday_list")
    months_holidays = frappe.db.sql('''
              select holiday_date, description
              from `tabHoliday`
              where holiday_date >= %(from)s and holiday_date <= %(to)s
              and parent = %(holiday_list)s
              and weekly_off =0
              order by holiday_date asc
              ''',{
                  "from":month_first_date,
                  "to":month_last_date,
                  "holiday_list":holiday_list
                  },as_dict=True)
    def get_day(data):
        print(data)
        data['day'] = data['holiday_date'].strftime('%d-%m')
        # data['day'] = data['holiday_date'].day
    list(map(get_day,months_holidays))
    return months_holidays


@frappe.whitelist()
def create_leave_application(info):
    info = frappe.parse_json(info)
    keys = ['employee','from_date','to_date','leave_approver','status','description']

    for key in keys:
        if key not in info:
            info[key] = None

    leave_application_doc = frappe.new_doc("Leave Application")
    leave_application_doc.update(info)
    leave_application_doc.leave_approver = frappe.get_value("Employee","HR-EMP-00001","leave_approver")
    try:
        leave_application_doc.insert()
        leave_application_doc_link = get_link_to_form("Leave Application",leave_application_doc.name)
        frappe.msgprint("{0} Created".format(leave_application_doc_link))
        return leave_application_doc_link
    except:
        error_log = frappe.log_error(frappe.get_traceback())
        error_log_link = get_link_to_form("Error Log",error_log.name)
        frappe.msgprint("{0} Created".format(error_log_link))
        return error_log_link

@frappe.whitelist()
def get_checkin(employee):
    today = nowdate()
    checkin_for_the_day = frappe.db.sql("""
                                        SELECT name, time , log_type
                                        from `tabEmployee Checkin`
                                        where date(time) BETWEEN date(%(today)s) AND date(%(today)s)
                                        AND log_type="IN"
                                        AND employee =%(employee)s
                                        order by time asc
                                        """,
                                        {"today":today,"employee":employee},as_dict=1)
    checkout_for_the_day = frappe.db.sql("""
                                        SELECT name, time , log_type
                                        from `tabEmployee Checkin`
                                        where date(time) BETWEEN date(%(today)s) AND date(%(today)s)
                                        AND log_type="OUT"
                                        AND employee =%(employee)s
                                        order by time asc
                                        """,
                                        {"today":today,"employee":employee},as_dict=1)
    check_in_out = {"checkin":checkin_for_the_day,"checkout":checkout_for_the_day,"checkin_count":len(checkin_for_the_day),"checkout_count":len(checkout_for_the_day)}
    return check_in_out

@frappe.whitelist()
def get_employee_with_birthday_this_month():
    conditions = ""
    month = frappe.utils.now_datetime().month
    conditions += " and month(date_of_birth) = '%s'" % month
    birthday_persons = frappe.db.sql("""select name, employee_name, date_of_birth
                                     from tabEmployee
                                     where status = 'Active' %s
                                     order by date_of_birth DESC""" % conditions, as_dict=True)
    def get_day(data):
        print(data)
        data['day'] = data['date_of_birth'].strftime('%d-%m')
    list(map(get_day,birthday_persons))
    return birthday_persons

@frappe.whitelist()
def get_employee_on_leave_this_month(department):
    month_first_date = get_first_day(nowdate())
    if frappe.get_meta('Attendance').get_field('workflow_state'):
        leave_info = frappe.db.sql('''select employee_name, from_date, to_date, half_day
                    from `tabLeave Application`
                    where docstatus=1
                    and from_date >=%(from_date)s
                    order by from_date asc
                    ''',
                    {'from_date':month_first_date},
                    as_dict=1
                    )
    else:
        leave_info = frappe.db.sql('''select employee_name, from_date, to_date, half_day
                  from `tabLeave Application`
                  where docstatus=1
                  and  status='Approved'
                  and from_date >=%(from_date)s
                  order by from_date asc
                  ''',
                  {'from_date':month_first_date},
                  as_dict=1
                  )
    def get_day(data):
        data['from'] = data['from_date'].strftime('%d-%m')
        data['to'] = data['to_date'].strftime('%d-%m')
    list(map(get_day,leave_info))
    absent_today = frappe.db.get_all("Attendance",filters={'department' : department,'status':"Absent",'attendance_date':frappe.utils.get_datetime().date()},fields=['employee_name'])
    employee = get_active_employees()
    for emp in employee:
        if frappe.db.count('Attendance',filters={'department' : department,'employee':emp.name,'attendance_date':frappe.utils.get_datetime().date()}) == 0:
            absent_today.append({'employee_name':emp.employee_name,})
    return leave_info, absent_today

def on_login():
    # frappe.msgprint(_(frappe.session.user))
    # frappe.local.flags.redirect_location = "/ess/"
    # frappe.local.response["location"] =  frappe.utils.get_url("/ess/")
    # frappe.msgprint(_(frappe.session.user))
    if frappe.session.user:
        frappe.msgprint(_(frappe.session.user))
        employee_docname = frappe.db.exists(
            {'doctype': 'Employee', 'user_id': frappe.session.user})
        if employee_docname:
            # frappe.db.exists returns a tuple of a tuple
            emp = frappe.get_doc('Employee', employee_docname)
            frappe.msgprint(_(emp.employee))
    #         frappe.local.flags.redirect_location = "/ess/"
    #         raise frappe.Redirect
    # else:
    #     frappe.msgprint("Couldn't Get your name")

@frappe.whitelist()
def get_approval_doc():
    approvals = []
    leave_applications = len(frappe.db.get_all("Leave Application",filters={'leave_approver':frappe.session.user,'status':'Open'}))
    todo = len(frappe.db.get_all("ToDo",filters={'owner':frappe.session.user,'status':'Open'}))
    claim = len(frappe.db.get_all("Expense Claim",filters={'expense_approver':frappe.session.user,'status':'Draft'}))
    travel_request = len(frappe.db.get_all("Travel Request",filters={'approver':frappe.session.user}))
    if frappe.get_meta('Attendance').get_field('workflow_state'):
        attendance = len(frappe.db.get_all("Attendance",filters={'attendance_approver':frappe.session.user,'workflow_state':'Draft'}))
    else:
        attendance = len(frappe.db.get_all("Attendance",filters={'attendance_approver':frappe.session.user}))
    if frappe.get_meta('Appraisal').get_field('workflow_state'):
        appraisal = len(frappe.db.get_all("Appraisal",filters={'appraisal_approver':frappe.session.user,'workflow_state':'Pending Self Review'}))
        appraisal_confirmation = len(frappe.db.get_all("Appraisal",filters={'appraisal_approver':frappe.session.user,'workflow_state':'Pending Self Review'}))
    else:
        appraisal = len(frappe.db.get_all("Appraisal",filters={'appraisal_approver':frappe.session.user,'status':'Draft'}))
        appraisal_confirmation = len(frappe.db.get_all("Appraisal",filters={'appraisal_approver':frappe.session.user,'status':'Draft'}))
    
    return {
            "Leave Application":leave_applications,
            "ToDo":todo,
            "Expense Claim":claim,
            "Travel Request":travel_request,
            'Attendance':attendance,
            "Appraisal":appraisal
            }

@frappe.whitelist()
def get_hr_admin_data():
    head_count = frappe.db.count('Employee',{"status":"Active"})
    new_joiners =frappe.db.count('Job Applicant',{"status":"Accepted"})
    exits = frappe.db.sql('''select count(*) as count from `tabEmployee Separation` where boarding_status in ("Pending","In Process")''',as_dict=True)[0]['count'] #frappe.db.count('Employee Separation',{"status":["in",["Pending","In Process"]]})
    present = frappe.db.count('Attendance',{"status":"Present","attendance_date":frappe.utils.get_datetime().date()})
    on_leave = frappe.db.count('Attendance',{"status":"On Leave","attendance_date":frappe.utils.get_datetime().date()})
    on_duty = frappe.db.count('Attendance',{"status":"Work From Home","attendance_date":frappe.utils.get_datetime().date()})
    return {
                "head_count" : head_count,
                "new_joiners" : new_joiners,
                "exits" : exits,
                "present" : present,
                "on_leave" : on_leave,
                "on_duty" : on_duty
            }

@frappe.whitelist()
def get_presenty(department=None):
    members_present_today = []
    members_absent_today = []
    active_employee = get_active_employees()
    for employee in active_employee:
        if frappe.db.exists("Employee Checkin",{"employee":employee.name}):
            members_present_today.append({"employee_name":employee.employee_name})
        else:
            members_absent_today.append({"employee_name":employee.employee_name})
    return {
        "members_present_today":members_present_today,
        "members_absent_today":members_absent_today
        }

@frappe.whitelist()
def get_presenty_(department):
    x, members_absent_today = get_employee_on_leave_this_month(department)
    # members_present_toady = frappe.get_all("Employee Checkin",filters=[['time','between',[nowdate(),nowdate()]]],fields=['employee_name'])
    members_present_today_ = set(frappe.get_all("Employee Checkin",filters=[['time','between',[nowdate(),nowdate()]]],pluck='employee_name'))
    members_present_today = []
    for row in members_present_today_:
        members_present_today.append({"employee_name":row})
    # members_on_duty = frappe.get_all("Employee Checkin",filters={'time':nowdate(),'status':'On Duty (OD)','department' :department},fields=['employee_name'])
        
    return {
        "members_present_today":members_present_today,
        "members_absent_today":members_absent_today
        }
# @frappe.whitelist()
# def get_presenty(department):
#     x, members_absent_today = get_employee_on_leave_this_month(department)
#     if frappe.get_meta('Attendance').get_field('workflow_state'):
#         members_present_toady = frappe.get_all('Attendance',filters={'attendance_date':nowdate(),'workflow_state':'Approved','status':['in',['Present','Work From Home']],'department': department},fields=['employee_name'])
#         members_on_duty = frappe.get_all('Attendance',filters={'attendance_date':nowdate(),'workflow_state':'Approved','status':'On Duty (OD)','department' :department},fields=['employee_name'])
#     else:
#         members_present_toady = frappe.get_all('Attendance',filters={'attendance_date':nowdate(),'status':['in',['Present','Work From Home']],'department': department},fields=['employee_name'])
#         members_on_duty = frappe.get_all('Attendance',filters={'attendance_date':nowdate(),'status':'On Duty (OD)','department' :department},fields=['employee_name'])
        
#     return {
#         "members_present_toady":members_present_toady,
#         "members_absent_today":members_absent_today,
#         "members_on_duty":members_on_duty,
#         }
