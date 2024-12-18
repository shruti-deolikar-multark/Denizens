


frappe.pages['dashboardpage'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        single_column: true
    });

    // Directly call functions without using frappe.after_ajax() to avoid infinite loop
    show_employee_count_card(page);
    show_new_hire_count(page);
    show_employee_exit_count(page);  // Uncomment if needed
    show_employee_join_count_this_quarter(page);  // Uncomment if needed
    render_ess_dashboard(page);
};

function show_employee_count_card(page) {
    // Render HTML template and append to the page
    $(frappe.render_template("dashboardpage")).appendTo(page.main);

    // Fetch employee count from backend
    frappe.call({
        method: 'ess.employee_self_service_portal.page.dashboardpage.dashboardpage.get_total_employee_count',
        callback: function(response) {
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
        method: 'ess.employee_self_service_portal.page.dashboardpage.dashboardpage.get_total_new_hires',
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

function show_employee_exit_count(page) {
    // Skip the function execution if data is already loaded
    if ($('#employee_exit_count_year').data('loaded') === true) {
        return;
    }

    // Call to fetch employee exit count for the current year
	frappe.call({
		method: 'ess.employee_self_service_portal.page.dashboardpage.dashboardpage.get_employee_exit_count',
		args: { year: 2024 },  // Pass year or leave it to use the current year
		callback: function(response) {
			console.log("Response from server:", response);
	
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


function show_employee_join_count_this_quarter(page) {
    // Ensure this function runs only once per page load to avoid infinite loop
    if ($('#employee_join_count_quarter').data('loaded') === true) {
        return; // Skip if data is already loaded
    }

    // Fetch employee join count (this quarter)
    frappe.call({
        method: 'ess.employee_self_service_portal.page.dashboardpage.dashboardpage.get_employee_join_count_this_quarter',
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


function render_ess_dashboard(page) {
    // Push the rendered template to the page
    // $(frappe.render_template("dashboardpage", {})).appendTo(page.main);
}

google.load("visualization", "1", {
    packages: ["corechart"]
});
google.setOnLoadCallback(initChart);

$(window).on("throttledresize", function (event) {
    initChart();
  
});

function initChart() {
    var options = {
      pieHole: 0.4,
	    legend:{position: 'bottom'},
      width: '50%',
      height: '80%',
      pieSliceText: 'percentage',
      colors: ['#7086FD', '##6FD195', '#FFAE4C,"#07DBFA',"#988AFC"],
      chartArea: {
        left: "3%",
        top: "3%",
        height: "84%",
        width: "94%"
      }
    };

    var data = google.visualization.arrayToDataTable([
        ["Distribuição Nutricional", "em Percentagem"],
        ["Hidratos de Carbono", 11],
        ["Lípidos", 2],
        ["Proteína", 2]
    ]);
    drawChart(data, options)
}

function drawChart(data, options) {
    var chart = new google.visualization.PieChart(document.getElementById('ne-food-chart'));
    chart.draw(data, options);
}

$(document).ready(function(){

	google.charts.load("current", {packages:["corechart"]});
	google.charts.setOnLoadCallback(drawChart);
	function drawChart() {
	var data = google.visualization.arrayToDataTable([
	['MacOs', 'Hours per Day'],
	['Work', 11],
	['Eat', 2],
	['Commute', 2],
	['Watch TV', 2],
	['Sleep', 7]
	]);
	
	var options = {
	title: 'Pie',
	pieHole: 0.4,
	};
	
	var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
	chart.draw(data, options);
	}
	
	});