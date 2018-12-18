import React from 'react'
import { navigate } from 'gatsby'

import Layout from '../components/layout'
import * as api from '../lib/api'
import Container from '../components/container'
import Row from '../components/row'
import SearchFormListing from '../components/search-form-listing'
import ListingGallery from '../components/listing-gallery'
import { queryToQuerystring, querystringToQuery, queryToBody, getDefaultForm } from '../lib/query'

class ListingPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      query: getDefaultForm(),
      units: [],
      types: [],
      neighborhoods: [],
      officeGroups: [],
    }

    this.handleSearchFormSubmit = this.handleSearchFormSubmit.bind(this)
  }

  async componentDidMount() {
    const query = { ...this.state.query, ...this.getQueryFromLocation() }

    const [{ types }, { neighborhoods }, { officeGroups }, { units }] = await Promise.all([
      api.getTypes(),
      api.getNeighborhoods(),
      api.getOfficeGroups(),
      this.getUnits(query),
    ])
    this.setState({ types, neighborhoods, officeGroups, query, units })
    // querystringToQuery(qs);
  }

  getUnits = async query => {
    const { page, pageSize } = this.state
    const body = queryToBody({ ...query, page, pageSize })
    return api.getUnits(body)
  }

  getQueryFromLocation = () => {
    const qs = window.location.search
    return querystringToQuery(qs)
  }

  handleQueryChange = (name, value) => {
    const query = { ...this.state.query, [name]: value }
    this.setState({ query })
  }

  handleSearchFormSubmit = async () => {
    const { query } = this.state
    const qs = queryToQuerystring(query)
    const { units } = await this.getUnits(query)

    navigate(`/listing?${qs}`)
    this.setState({ units })
  }

  render() {
    const { types, neighborhoods, officeGroups, query, units } = this.state

    return (
      <Layout>
        <Container>
          <Row>
            <aside className="col-12 col-sm-4 order-last" id="refine-search">
              <SearchFormListing
                onSubmit={this.handleSearchFormSubmit}
                onChange={this.handleQueryChange}
                query={query}
                types={types}
                neighborhoods={neighborhoods}
                officeGroups={officeGroups}
              />
            </aside>

            <section className="col-12 col-sm-8 order-first">
              <ListingGallery units={units} />
            </section>
          </Row>
        </Container>
      </Layout>
    )
  }
}

export default ListingPage
