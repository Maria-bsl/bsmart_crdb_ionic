# Copyright (C) 2024 The Qt Company Ltd.
# SPDX-License-Identifier: LicenseRef-Qt-Commercial OR GPL-3.0-only WITH Qt-GPL-exception-1.0

cmake_minimum_required(VERSION 3.16)

project(LoadersNaSpinnersApp VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 6.8 REQUIRED COMPONENTS Quick)

qt_standard_project_setup(REQUIRES 6.8)

qt_add_executable(LoadersNaSpinnersApp
    main.cpp
)

qt_add_qml_module(LoadersNaSpinnersApp
    URI LoadersNaSpinners
    VERSION 1.0
    QML_FILES Main.qml
)

target_link_libraries(LoadersNaSpinnersApp
    PRIVATE Qt6::Quick
)

install(TARGETS LoadersNaSpinnersApp
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR})
