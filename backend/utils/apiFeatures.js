class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString } // destructure request query body
        const excludedFields = ['page', 'sort', 'limit', 'fields'] // fields that should not be used in filtering data
        excludedFields.forEach(el => delete queryObj[el])

        // 1.B Advance Filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))

        return this;
    }

    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            // Modified by Abhinav: Added default sort by createdAt in descending order
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    limitingFields() {
        if(this.queryString.fields) {
            let fields = this.queryString.fields
            fields = fields.split(',').join('')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this;
    }

    paginate() {
        // 4. Pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 20;
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)

        return this;
    }
}

// exports.APIfeatures;
module.exports = APIfeatures;