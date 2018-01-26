Vue.component('big-image', {
    props: ['selectedImage'],
    data: function() {
        return {
            currentImage: null,
            commentData: {
                comment: '',
                username: ''
            }
        };
    },
    methods: {
        closeModal: function() {
            this.$emit('changed');
        },
        submitComment: function() {
            console.log("Comment submitted");
            axios.post('/submit-comment', {
                'comment': this.commentData.comment,
                'username': this.commentData.username,
                'id': this.currentImage.id
            })
                .then((response) => {

                    //append data!!!
                    console.log("/submit-comment");
                    if(response.data.success == true) {
                        console.log("Check submitted comment data", response.data)



                        this.commentData.unshift({
                            comment: response.data.comment,
                            username: response.data.username
                        });
                        console.log("Checking for current commentData second", this.commentData);
                    }

                });
        }
    },
    template: '#modal-component',
    mounted: function() {
        var self = this;
        axios.get('/getimages/' + this.selectedImage).then(function(response) {
            console.log("HIIIII");
            console.log("CHECK THE RESPONSE DATA", response.data);
            self.currentImage = response.data.modalImageData[0];
            self.commentData = response.data.commentData.reverse();
        });
        // axios.get('/get-comments', this.selectedImage)
        //     .then(function(response) {
        //         console.log(response.data)
        //     // self.commentData = response.data.reverse();
        //
        //     });
    }

});



var app = new Vue({
    el: '#main',
    data: {
        pagedata: '',
        selectedImage: null,
        formStuff: {
            title: '',
            description: '',
            username: '',
            file: null,
            comment: null,
            commentUsername: null
        }
    },
    methods: {
        uploadFile: function() {
            console.log("Upload file working");

            var formData = new FormData();
            formData.append('file', this.formStuff.file);
            formData.append('title', this.formStuff.title);
            formData.append('description', this.formStuff.description);
            formData.append('username', this.formStuff.username);

            axios.post('/upload-image', formData)
                .then(result => {
                    if(result.data.success == true) {
                        console.log("Checking for typeof object on upload-image", app.pagedata)
                        app.pagedata.unshift({
                            // created_at:,
                            description: result.data.description,
                            // id: ,
                            image: result.data.filename,
                            title: result.data.title,
                            username: result.data.username
                        });
                    }
                    console.log("test the result", result.data.success);
                    // receives res.json
                    // console.log("response from server", result);
                    // console.log()
                });
        },
        chooseFile: function(e) {
            console.log("Choose file working");
            this.formStuff.file = e.target.files[0];

        },
        currentlySelected: function(id) {
            this.selectedImage = id;
            console.log("Check this__________", this.selectedImage);


        },
    },
    mounted: function() {
        axios.get('/getimages').then(function(response) {
            console.log(response.data.imageData[0].title);
            console.log("LOOK GHERE!!!!", response.data.imageData);
            app.pagedata = response.data.imageData.reverse();

            console.log(app.pagedata[0].image);
        });

    }
});
