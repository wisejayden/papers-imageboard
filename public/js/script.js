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
        //On click, emits change to main, setting selectedImage ('id'), to null, hence closing the window.
        closeModal: function() {
            this.$emit('changed');
        },
        stopPropagation: function(e) {
            e.stopPropagation(e);
        },

        getComments: function() {

        },
        //Inside modal, make a post request to add comment data and then append to previous comments
        submitComment: function() {
            console.log("Comment submitted");
            axios.post('/submit-comment', {
                'comment': this.commentData.comment,
                'username': this.commentData.username,
                'id': this.currentImage.id
            })
                .then((response) => {
                    console.log("/submit-comment");
                    if(response.data.success == true) {
                        this.commentData.unshift({
                            comment: response.data.comment,
                            username: response.data.username
                        });
                    }
                });
        }
    },
    template: '#modal-component',
    //When component is mounted, and modal is enlarged,  get image and comment data by id, then add to components data field.
    mounted: function() {
        var self = this;
        axios.get('/getimages/' + this.selectedImage).then(function(response) {
            self.currentImage = response.data.modalImageData[0];
            self.commentData = response.data.commentData.reverse();
        });
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

            var formData = new FormData();
            formData.append('file', this.formStuff.file);
            formData.append('title', this.formStuff.title);
            formData.append('description', this.formStuff.description);
            formData.append('username', this.formStuff.username);

            axios.post('/upload-image', formData)
                .then(result => {
                    if(result.data.success == true) {
                        app.pagedata.unshift({
                            description: result.data.description,
                            image: result.data.filename,
                            title: result.data.title,
                            username: result.data.username
                        });
                    }
                });
        },
        chooseFile: function(e) {
            console.log("Choose file working");
            this.formStuff.file = e.target.files[0];
        },
        //On click, take images id and set it to selectedImage, opening modal
        currentlySelected: function(id) {
            this.selectedImage = id;
        },
    },
    mounted: function() {
        //Event listener to close modal on 'escape'
        document.addEventListener('keydown', function(e) {
            console.log(e.keyCode);
            if (e.keyCode === 27) {
                app.selectedImage = null;
            }
        });
        axios.get('/getimages').then(function(response) {
            app.pagedata = response.data.imageData.reverse();
        });
    }
});
