import frappe
from frappe import _

@frappe.whitelist()
def get_employee_data(employee_name):
    employee = frappe.get_doc("Employee", employee_name)

    # You can include other fields as needed
    data = {
        "education": employee.education,
        "department": employee.department,
        "name": employee.name
    }
    
    return data
