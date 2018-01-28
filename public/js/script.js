Vue.component('big-image', {
    props: ['selectedImage'],
    data: function() {
        return {
            currentImage: null,
            commentData: {
                comment: '',
                username: ''
            },
            comments: [],
            errorModalUsername: false,
            errorModalComment: false
        };
    },
    methods: {
        //On click, emits change to main, setting selectedImage ('id'), to null, hence closing the window.
        closeModal: function() {
            this.$emit('changed');
        },
        stopPropagation: function(e) {
            e.stopPropagation(e);
        },

        getComments: function() {
            axios.get('/get-comments/' + this.selectedImage)
                .then((res) => {
                    this.comments = res.data.commentData.reverse();
                });
        },
        //Inside modal, make a post request to add comment data and then append to previous comments
        submitComment: function() {
            console.log("Comment submitted");


            this.errorModalUsername = false;
            this.errorModalComment = false;
            if(this.commentData.username.length === 0 && this.commentData.comment.length === 0) {
                this.errorModalUsername = true;
                this.errorModalComment = true;
            } else if (this.commentData.username.length === 0) {
                this.errorModalUsername = true;
            } else if (this.commentData.comment.length === 0) {
                this.errorModalComment = true;
            }else {
                axios.post('/submit-comment', {
                    'comment': this.commentData.comment,
                    'username': this.commentData.username,
                    'id': this.currentImage.id
                })
                    .then((res) => {
                        console.log("/submit-comment");
                        if(res.data.success == true) {
                            console.log("console log res.data", res.data);
                            this.comments = res.data.comments.reverse();
                            this.commentData = {
                                comment: '',
                                username: ''
                            };
                        }
                    });
            }


        }
    },
    template: '#modal-component',
    //When component is mounted, and modal is enlarged,  get image and comment data by id, then add to components data field.
    mounted: function() {
        var self = this;
        axios.get('/getimages/' + this.selectedImage).then(function(response) {
            console.log(response.data);
            self.currentImage = response.data.modalImageData[0];
        });
    }
});



var app = new Vue({
    el: '#main',
    data: {
        pagedata: '',
        heroimage: '',
        selectedImage: null,
        clickedUpload: false,
        formStuff: {
            title: '',
            description: '',
            username: '',
            file: null,
            comment: null,
            commentUsername: null,
        },
        errorUploadFile: false,
        errorUploadTitle: false,
        errorUploadDescription: false,
        errorUploadUsername: false,
        errorFileSize: false
    },
    methods: {
        uploadFile: function() {
            this.errorUploadFile = false;
            this.errorUploadTitle = false;
            this.errorUploadDescription =  false;
            this.errorUploadUsername = false;

            var incorrectInfo = false;

            if(this.formStuff.file === null) {
                this.errorUploadFile = true;
                incorrectInfo = true;
            }
            if(this.formStuff.title.length === 0) {
                this.errorUploadTitle = true;
                incorrectInfo = true;
            }
            if(this.formStuff.description.length === 0) {
                this.errorUploadDescription =  true;
                incorrectInfo = true;
            }
            if(this.formStuff.username.length === 0) {
                this.errorUploadUsername = true;
                incorrectInfo = true;
            }


            var formData = new FormData();
            formData.append('file', this.formStuff.file);
            formData.append('title', this.formStuff.title);
            formData.append('description', this.formStuff.description);
            formData.append('username', this.formStuff.username);

            if (incorrectInfo === true) {
                console.log('error filling out data');
            } else {
                this.clickedUpload = false;
                axios.post('/upload-image', formData)
                    .then(result => {
                        if(result.data.success == true) {
                            this.clickedUpload = false;
                            this.formStuff = {
                                title: '',
                                description: '',
                                username: '',
                                file: null,
                                comment: null,
                                commentUsername: null
                            };
                            app.pagedata.unshift({
                                description: result.data.description,
                                image: result.data.filename,
                                title: result.data.title,
                                username: result.data.username
                            });
                        } else {
                            this.errorFileSize = true;
                        }
                    });
            }

        },
        chooseFile: function(e) {
            console.log("Choose file working");
            this.formStuff.file = e.target.files[0];


        },
        //On click, take images id and set it to selectedImage, opening modal
        currentlySelected: function(id) {
            this.selectedImage = id;
        },
        uploadOption: function() {
            this.clickedUpload = true;

        },
        cancel: function() {
            this.clickedUpload = false;
            this.errorUploadFile = false;
            this.errorUploadTitle = false;
            this.errorUploadDescription =  false;
            this.errorUploadUsername = false;

            this.formStuff = {
                title: '',
                description: '',
                username: '',
                file: null,
                comment: null,
                commentUsername: null,
            };
        }
    },
    mounted: function() {
        //Event listener to close modal on 'escape'
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 27) {
                app.selectedImage = null;
            }
        });
        axios.get('/getimages').then(function(response) {
            var imageData = response.data.imageData;

            app.heroimage = imageData[Math.floor(Math.random() * imageData.length)];

            app.pagedata = imageData.reverse();
        });
    }
});
