// ** React Imports
import { Fragment, useState, useRef } from 'react'

// ** Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Sun, Moon } from 'react-feather'

// ** Hooks
import { useSkin } from '@hooks/useSkin'

// ** Navbar components
import UserDropdown from '../../navbar/UserDropdown'

// ** Vertical Menu Components
import VerticalMenuHeader from './VerticalMenuHeader'
import VerticalNavMenuItems from './VerticalNavMenuItems'

const Sidebar = props => {
  // ** Props
  const { menuCollapsed, routerProps, menu, currentActiveItem, skin, menuData } = props

  // ** States
  const [groupOpen, setGroupOpen] = useState([])
  const [groupActive, setGroupActive] = useState([])
  const [currentActiveGroup, setCurrentActiveGroup] = useState([])
  const [activeItem, setActiveItem] = useState(null)

  // ** Menu Hover State
  const [menuHover, setMenuHover] = useState(false)

  // ** Ref
  const shadowRef = useRef(null)

  // ** Skin
  const { skin: currentSkin, setSkin } = useSkin()

  const isExpanded = menuHover || menuCollapsed === false

  // ** Function to handle Mouse Enter
  const onMouseEnter = () => {
    setMenuHover(true)
  }

  // ** Scroll Menu
  const scrollMenu = container => {
    if (shadowRef && container.scrollTop > 0) {
      if (!shadowRef.current.classList.contains('d-block')) {
        shadowRef.current.classList.add('d-block')
      }
    } else {
      if (shadowRef.current.classList.contains('d-block')) {
        shadowRef.current.classList.remove('d-block')
      }
    }
  }

  return (
    <Fragment>
      <div
        className={classnames('main-menu menu-fixed menu-accordion menu-shadow', {
          expanded: isExpanded,
          'menu-light': skin !== 'semi-dark' && skin !== 'dark',
          'menu-dark': skin === 'semi-dark' || skin === 'dark'
        })}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => setMenuHover(false)}
      >
        {menu ? (
          menu
        ) : (
          <Fragment>
            {/* Vertical Menu Header */}
            <VerticalMenuHeader setGroupOpen={setGroupOpen} menuHover={menuHover} {...props} />
            {/* Vertical Menu Header Shadow */}
            <div className='shadow-bottom' ref={shadowRef}></div>
            {/* Perfect Scrollbar */}
            <PerfectScrollbar
              className='main-menu-content'
              options={{ wheelPropagation: false }}
              onScrollY={container => scrollMenu(container)}
            >
              <ul className='navigation navigation-main'>
                <VerticalNavMenuItems
                  items={menuData}
                  menuData={menuData}
                  menuHover={menuHover}
                  groupOpen={groupOpen}
                  activeItem={activeItem}
                  groupActive={groupActive}
                  currentActiveGroup={currentActiveGroup}
                  routerProps={routerProps}
                  setGroupOpen={setGroupOpen}
                  menuCollapsed={menuCollapsed}
                  setActiveItem={setActiveItem}
                  setGroupActive={setGroupActive}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  currentActiveItem={currentActiveItem}
                />
              </ul>
            </PerfectScrollbar>

            {/* Sidebar Footer — theme toggle + user dropdown */}
            <div className='main-menu-footer border-top'>
              <ul className='navigation navigation-main'>
                <li className='nav-item'>
                  <a
                    className='d-flex align-items-center'
                    style={{ cursor: 'pointer', padding: '10px 15px' }}
                    onClick={() => setSkin(currentSkin === 'dark' ? 'light' : 'dark')}
                  >
                    {currentSkin === 'dark'
                      ? <Sun size={20} style={{ marginRight: '1.1rem', flexShrink: 0 }} />
                      : <Moon size={20} style={{ marginRight: '1.1rem', flexShrink: 0 }} />}
                    {isExpanded && (
                      <span className='menu-title'>
                        {currentSkin === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
                      </span>
                    )}
                  </a>
                </li>
              </ul>
              <div className={classnames('sidebar-user-footer', { expanded: isExpanded })}>
                <UserDropdown />
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  )
}

export default Sidebar
