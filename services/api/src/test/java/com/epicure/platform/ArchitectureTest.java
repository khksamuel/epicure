package com.epicure.platform;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.epicure.platform")
class ArchitectureTest {

    @ArchTest
    static final ArchRule application_is_independent_of_delivery_and_infrastructure = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                    "com.epicure.platform.web..",
                    "com.epicure.platform.infrastructure.."
            );

    @ArchTest
    static final ArchRule infrastructure_is_independent_of_web = noClasses()
            .that().resideInAPackage("..infrastructure..")
            .should().dependOnClassesThat()
            .resideInAPackage("com.epicure.platform.web..");
}
