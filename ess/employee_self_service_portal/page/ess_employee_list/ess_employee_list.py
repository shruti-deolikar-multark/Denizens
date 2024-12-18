import frappe
from datetime import datetime, timedelta
import calendar

@frappe.whitelist()
def get_total_employee_count():
    """
    Return the total count of employees in the system.
    """
    try:
        # Get the count of Employee records from the database
        total_employees = frappe.db.count('Employee', filters={
            'status': 'Active',
        })
        return total_employees
    except Exception as e:
        frappe.log_error(message=str(e), title="Employee Count Fetch Error")
        return {"error": "Unable to fetch employee count"}


@frappe.whitelist()
def get_employee_expiry_count_within_60_days():
    try:
        # Get the current date
        current_date = datetime.today().strftime('%Y-%m-%d')

        # Calculate the date 60 days from now
        expiry_threshold_date = (datetime.today() + timedelta(days=60)).strftime('%Y-%m-%d')

        # Log the filtering details for debugging
        frappe.log_error(message=f"Filtering employees with expiry date between {current_date} and {expiry_threshold_date}",
                         title="Employee Expiry Date Filter")

        # Fetch employees whose expiry date is within the next 60 days
        employees_with_expiry = frappe.db.get_all('Employee', filters={
            'custom_valid_till': ['between', [current_date, expiry_threshold_date]]  # Replace 'expiry_date' with your field name
        }, fields=['custom_valid_till'])

        # Log the fetched data for debugging
        frappe.log_error(message=f"Fetched Expiry Data: {employees_with_expiry}", title="Employee Expiry Data")

        # Return the count of employees with expiry within 60 days
        return len(employees_with_expiry)

    except Exception as e:
        # Log the full error message
        frappe.log_error(message=str(e), title="Employee Expiry Count Fetch Error")
        return {"error": f"Unable to fetch employee expiry count: {str(e)}"}



@frappe.whitelist()
def get_total_new_hires(days=30):
    """
    Return the total count of employees who joined within the last `days` days.
    Default is 30 days.
    """
    try:
        # Calculate the date range (last `days` days)
        today = datetime.today()
        recent_date = today - timedelta(days=int(days))

        # Fetch the count of new hires
        total_new_hires = frappe.db.count('Employee', filters={
            'date_of_joining': [">=", recent_date.strftime('%Y-%m-%d')],
            'status': 'Active'  # Optional: Filter for active employees
        })

        return total_new_hires

    except Exception as e:
        frappe.log_error(message=str(e), title="New Hire Count Fetch Error")
        return {"error": "Unable to fetch new hire count"}

@frappe.whitelist()
def get_employee_exit_count(year=None):
    try:
        # Use the current year if no year is provided
        if not year:
            year = datetime.today().year

        # Calculate the start and end date for the given year
        start_date = f'{year}-01-01'
        end_date = f'{year}-12-31'

        # Log the filtering details for debugging
        frappe.log_error(message=f"Filtering employee exits from {start_date} to {end_date} with status 'Left'", title="Employee Exit Count Filter")

        # Try to fetch the employee exits based on relieving date and status
        exits = frappe.db.get_all('Employee', filters={
            # 'relieving_date': ['between', start_date, end_date],
            'status': 'Left',  # Filter for employees who have left
        }, fields=['status'])

        # Log the fetched data for debugging
        frappe.log_error(message=f"Fetched Exits: {exits}", title="Employee Exit Data")

        # Return the count of exits (as an integer)
        return len(exits)

    except Exception as e:
        # Log the full error message
        frappe.log_error(message=str(e), title="Employee Exit Count Fetch Error")
        return {"error": f"Unable to fetch employee exit count: {str(e)}"}


@frappe.whitelist()
def get_employee_join_count_this_quarter():
    try:
        # Get the current date
        today = datetime.today()

        # Calculate the start date of the current quarter
        quarter_start_month = (today.month - 1) // 3 * 3 + 1  # Start month of the quarter (1, 4, 7, 10)
        quarter_start_date = datetime(today.year, quarter_start_month, 1)

        # Fetch the count of employees who joined after the start of the current quarter
        total_employees_joined = frappe.db.count('Employee', filters={
            'date_of_joining': ['>=', quarter_start_date.strftime('%Y-%m-%d')],
            'status': 'Active'  # Optional: Filter for active employees
        })

        return total_employees_joined

    except Exception as e:
        frappe.log_error(message=str(e), title="Employee Join Count This Quarter Error")
        return {"error": "Unable to fetch employee join count for this quarter"}


import frappe

@frappe.whitelist()
def get_employee_missing_contact_count():
    try:
        # Define the fields to check for missing contact details
        missing_contact_fields = ['cell_number', 'personal_email', 'current_address']

        # Fetch employees with missing contact details
        employees_with_missing_contact = frappe.db.get_all(
            'Employee',
            filters=[
                ['cell_number', 'in', [None, '']],
                ['personal_email', 'in', [None, '']],
                ['current_address', 'in', [None, '']]
            ],
            fields=['cell_number', 'personal_email', 'current_address']
        )

        # Log the fetched data for debugging
        frappe.log_error(
            message=f"Employees with missing contact details: {employees_with_missing_contact}",
            title="Missing Contact Details"
        )

        # Return the count of employees with missing contact details
        return len(employees_with_missing_contact)

    except Exception as e:
        # Log the full error message
        frappe.log_error(message=str(e), title="Employee Missing Contact Count Error")
        return {"error": f"Unable to fetch employee missing contact count: {str(e)}"}
