from . import __version__ as app_version

app_name = "ess"
app_title = "Employee Self Service Portal"
app_publisher = "fitsterp"
app_description = "Custom ESS"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "support@firsterp.in"
app_license = "MIT"


on_session_creation = ["ess.employee_self_service_portal.page.ess.ess.on_login"]
extend_bootinfo = "ess.boot.boot_session"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = ["main.bundle.css", "ess_dummy.css", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css", "dashboardpage.css", "ess_employee_list.css"]
app_include_js = ["/assets/ess/js/ess-template.min.js", "https://www.gstatic.com/charts/loader.js"]

# include js, css files in header of web template
# web_include_css = "/assets/ess/css/ess.css"
# web_include_js = "/assets/ess/js/ess.js"
# apps/ess/ess/employee_self_service_portal/page/ess_dummy/ess_dummy.css
# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "ess/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
page_js = {"dashboardpage" : "apps/ess/ess/employee_self_service_portal/page/dashboardpage/dashboardpage.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "ess.utils.jinja_methods",
# 	"filters": "ess.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "ess.install.before_install"
# after_install = "ess.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "ess.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"ess.tasks.all"
# 	],
# 	"daily": [
# 		"ess.tasks.daily"
# 	],
# 	"hourly": [
# 		"ess.tasks.hourly"
# 	],
# 	"weekly": [
# 		"ess.tasks.weekly"
# 	],
# 	"monthly": [
# 		"ess.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "ess.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "ess.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "ess.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"ess.auth.validate"
# ]

