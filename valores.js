var n = 5
function Graphic() {
   // 
    
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {

        var data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Day'],
          ['Work',     120],
          ['Eat',     n],
          ['Commute',  85],
          ['Watch TV', 89],
          ['Sleep',    7]
        ]);
        /*var data = [
        ['Task',   4]
        ['Work',     11],
        ['Eat',      2],
        ['Commute',  2],
        ['Watch TV', 2],
        ['Sleep',    7]
        ]*/
          
        //var nData = google.visualization.arrayToDataTable(data)
         

        var options = {
          title: 'My Daily Activities'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        console.log(typeof(data))
        
        chart.draw(data, options);
}  
    }
    
 

 Graphic()