
var app = new Vue({
    el: '#main',
    data: {
        pagedata: ''
    },
    mounted: function() {
        axios.get('/getimages').then(function(response) {
            console.log(response.data.imageData[0].title)
            app.pagedata = response.data.imageData;
            console.log(app.pagedata[0].image);
        });

    }
});
