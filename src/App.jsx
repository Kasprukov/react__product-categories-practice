/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const getCategoryById = categoryId =>
  categoriesFromServer.find(category => category.id === categoryId) || null;

const getUserById = userId =>
  usersFromServer.find(user => user.id === userId) || null;

const getPreparedProducts = (
  products,
  { query = '', userSelected = null, selectedCategories = [] },
) => {
  let preparedProducts = [...products];
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    preparedProducts = preparedProducts.filter(product =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  }

  if (userSelected !== 'All') {
    preparedProducts = preparedProducts.filter(product => {
      const category = getCategoryById(product.categoryId);

      return category && category.ownerId === userSelected.id;
    });
  }

  if (selectedCategories.length > 0) {
    preparedProducts = preparedProducts.filter(product =>
      selectedCategories.includes(product.categoryId),
    );
  }

  return preparedProducts;
};

export const App = () => {
  const [userSelected, setUserSelected] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const sortedProducts = [
    ...getPreparedProducts(productsFromServer, {
      query,
      userSelected,
      selectedCategories,
    }),
  ];

  const isAnyVisibleProducts = sortedProducts.length > 0;

  const toggleCategory = categoryId => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                className={cn({ 'is-active': userSelected === 'All' })}
                href="#/"
                onClick={() => setUserSelected('All')}
              >
                All
              </a>

              {usersFromServer.map(user => {
                const { name, id } = user;
                const isThisUserSelected = userSelected.id === id;

                return (
                  <a
                    data-cy="FilterUser"
                    className={cn({ 'is-active': isThisUserSelected })}
                    href="#/"
                    onClick={() => setUserSelected(user)}
                    key={id}
                  >
                    {name}
                  </a>
                );
              })}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  onChange={event => setQuery(event.target.value)}
                  value={query}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      onClick={() => setQuery('')}
                      type="button"
                      className="delete"
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length === 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.id),
                  })}
                  href="#/"
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setQuery('');
                  setUserSelected('All');
                  setSelectedCategories([]);
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {isAnyVisibleProducts ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">ID</span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">Product</span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">User</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map(product => {
                  const category = getCategoryById(product.categoryId);
                  const user = getUserById(category.ownerId);
                  const isMale = user.sex === 'm';
                  const isFemale = user.sex === 'f';

                  return (
                    <tr data-cy="Product" key={product.id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {product.id}
                      </td>

                      <td data-cy="ProductName">{product.name}</td>
                      <td data-cy="ProductCategory">{`${category.icon} - ${category.title}`}</td>

                      <td
                        data-cy="ProductUser"
                        className={cn({
                          'has-text-link': isMale,
                          'has-text-danger': isFemale,
                        })}
                      >
                        {user.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
